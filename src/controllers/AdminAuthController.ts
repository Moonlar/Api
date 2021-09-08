import conn from '../database/Connection';

import Password from '../utils/Password';
import { GenerateToken } from '../utils/GenerateToken';
import { Errors, Success } from '../utils/Response';
import { AdminUserLogInSchema } from '../utils/Validators';

import { AdminUserData, Controller } from '../typings';

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
        error: Errors.NEED_LOGOUT,
      });

    // Dados de login
    let { email, password } = req.body as CreateAuthData;

    // Validar dados
    try {
      AdminUserLogInSchema.validateSync(
        { email, password },
        { abortEarly: false }
      );
    } catch (err: any) {
      return res
        .status(400)
        .json({ error: Errors.INVALID_REQUEST, errors: err.errors });
    }

    // Formatar dados
    const data = AdminUserLogInSchema.cast({ email, password });

    // Verificar se o usuário existe
    const user: AdminUserData = await conn('admin_users')
      .select('*')
      .where('email', data.email)
      .where('deleted_at', null)
      .first();

    if (!user) return res.status(404).json({ error: Errors.NOT_FOUND });

    // Testar senha
    if (!Password.compare(user.password, data.password!)) {
      return res.status(401).json({ error: Errors.WRONG_PASSWORD });
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

    return res.status(201).json({ message: Success.LOGIN });
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
      .json({ message: Success.LOGOUT });
  },
} as Controller;
