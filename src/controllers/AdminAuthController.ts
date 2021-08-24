import conn from '../database/Connection';

import { AdminUserData, Controller } from '../typings';
import { GenerateToken } from '../utils/GenerateToken';
import Password from '../utils/Password';
import { AdminUserLogInSchema } from '../utils/Validators';

interface CreateAuthData {
  email?: string;
  password?: string;
}

// (Segundos) * (Minutos) * (Horas) * (Dias)
const ONE_WEEK = 1000 * 60 * 24 * 7;

export const AdminAuthController = {
  async index(req, res) {
    if (!req.isAuth) return res.authError();

    return res.json({
      nickname: req.user!.nickname,
      permission: req.user!.permission,
    });
  },

  async create(req, res) {
    if (req.isAuth)
      return res.status(401).json({
        error: 'You are already connected',
      });

    let { email, password } = req.body as CreateAuthData;
    if (email) email = email.trim();
    if (password) password = password.trim();

    // Fazer validação
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

    const user: AdminUserData = await conn('admin_users')
      .select('*')
      .where('email', email)
      .where('deleted_at', null)
      .first();

    if (!user) return res.status(404).json({ message: 'User not exists' });

    if (!Password.compare(user.password, String(password))) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    const token = GenerateToken(ONE_WEEK, {
      nickname: user.nickname,
      permission: user.permission,
    });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: ONE_WEEK,
      secure: process.env.NODE_ENV === 'production',
    });

    return res.json({ message: 'Successfully logged in' });
  },

  async delete(req, res) {
    if (!req.isAuth) return res.authError();

    return res
      .cookie('token', '', {
        httpOnly: true,
        maxAge: 0,
        secure: process.env.NODE_ENV === 'production',
      })
      .json({ message: 'You disconnected' });
  },
} as Controller;
