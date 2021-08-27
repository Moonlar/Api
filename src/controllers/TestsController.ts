import { GenerateToken } from '../utils/GenerateToken';
import { Errors, Success } from '../utils/Response';

import { Controller } from '../typings';

const TOKEN_VALIDITY = 1000 * 60 * 60 * 2;

const data: {
  [key: string]: { nickname: string; permission: 'user' | 'admin' | 'manager' };
} = {
  user: {
    nickname: 'User',
    permission: 'user',
  },
  admin: {
    nickname: 'Admin',
    permission: 'admin',
  },
  manager: {
    nickname: 'Manager',
    permission: 'manager',
  },
};

export const TestsController = {
  async create(req, res) {
    // Verificar ambiente
    if (process.env.NODE_ENV === 'production')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Pegar dados do usuário fake
    const { level } = req.params as { level: string };

    const user = data[level];

    // Verificar se foi um nível de permissão válido
    if (!user) return res.status(404).json({ error: Errors.INVALID_REQUEST });

    // Gerar token com dados do usuário fake
    const token = GenerateToken(TOKEN_VALIDITY, {
      nickname: user.nickname.toLowerCase(),
      permission: user.permission,
    });

    // Retornar token em cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: TOKEN_VALIDITY,
      secure: false,
    });

    return res.json({ message: Success.LOGIN });
  },
} as Controller;
