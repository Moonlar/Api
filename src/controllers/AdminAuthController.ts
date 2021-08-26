import conn from '../database/Connection';

import { AdminUserData, Controller } from '../typings';
import { GenerateToken } from '../utils/GenerateToken';
import Password from '../utils/Password';
import { AdminUserLogInSchema } from '../utils/Validators';

interface CreateAuthData {
  email?: string;
  password?: string;
}

// (1 Segundo) (Segundos) * (Minutos) * (Horas)
const TOKEN_VALIDITY = 1000 * 60 * 60 * 2;

export const AdminAuthController = {
  async index(req, res) {
    // Se não estiver estiver
    if (!req.isAuth) return res.authError();

    // Retornar dados da sessão
    return res.json({
      nickname: req.user!.nickname,
      permission: req.user!.permission,
    });
  },

  async create(req, res) {
    // Retornar erro se já estiver conectado
    if (req.isAuth)
      return res.status(401).json({
        error: 'You are already connected',
      });

    // Dados de login
    let { email, password } = req.body as CreateAuthData;
    if (email) email = email.trim();
    if (password) password = password.trim();

    // Validar dados
    try {
      AdminUserLogInSchema.validateSync(
        { email, password },
        { abortEarly: false }
      );
    } catch (err) {
      return res
        .status(400)
        .json({ error: 'Invalid body', errors: err.errors });
    }

    // Verificar se o usuário existe
    const user: AdminUserData = await conn('admin_users')
      .select('*')
      .where('email', email)
      .where('deleted_at', null)
      .first();

    if (!user) return res.status(404).json({ error: 'User not exists' });

    // Testar senha
    if (!Password.compare(user.password, String(password))) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    // Gerar token com dados do usuário
    const token = GenerateToken(TOKEN_VALIDITY, {
      nickname: user.nickname.toLowerCase(),
      permission: user.permission,
    });

    // Retornar token em cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: TOKEN_VALIDITY,
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(201).json({ message: 'Successfully logged in' });
  },

  async delete(req, res) {
    // Se o usuário não estiver conectado
    if (!req.isAuth) return res.authError();

    // Remover token da whitelist
    /* TO-DO */

    // Limpar cookie com token
    return res
      .cookie('token', '', {
        httpOnly: true,
        maxAge: 0,
        secure: process.env.NODE_ENV === 'production',
      })
      .json({ message: 'You disconnected' });
  },
} as Controller;
