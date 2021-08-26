import { v4 as uuid } from 'uuid';

import conn from '../database/Connection';
import Password from '../utils/Password';
import { Errors, Success } from '../utils/Response';
import {
  CreateAdminUserSchema,
  UpdateAdminUserSchema,
} from '../utils/Validators';

import { AdminUserData, Controller } from '../typings';

interface CreateAdminUserData {
  nickname?: string;
  email?: string;
}

interface UpdateAdminUserData {
  nickname?: string;
  email?: string;
  permission?: string;
}

export const AdminUsersController = {
  async show(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Se o nível de permissão não for manager
    if (req.user!.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Parâmetros de busca
    let page = Number(req.query.page || '1');
    let search = (req.query.search || '').toString();
    const limit = 10;

    // Informações
    const length = Number(
      (await conn('admin_users').count('id'))[0]['count(`id`)']
    );
    const pages = Math.ceil(length / limit) || 1;

    // Validar página de busca
    if (isNaN(page) || page <= 0) page = 1;

    if (page > pages) page = pages;

    // Buscar no banco de dados
    const users: AdminUserData[] = await conn('admin_users')
      .select('*')
      .where('nickname', 'like', `%${search}%`)
      .offset((page - 1) * limit)
      .limit(limit);

    // Remover dados sensíveis
    const serializedUsers = users.map((user) => ({
      ...user,
      password: undefined,
      email: undefined,
    }));

    return res.json({
      page,
      total_pages: pages,
      total_users: length,
      limit,
      users: serializedUsers,
    });
  },

  async index(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Pegar parâmetro nickname da url
    let { identifier } = req.params as { identifier?: string };
    identifier = identifier?.toLowerCase();

    // Verificar se ele tem permissão para acessar estes dados
    if (identifier && req.user!.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Buscar dados
    const user: AdminUserData = await conn('admin_users')
      .select('*')
      .where('identifier', identifier ? identifier : req.user!.nickname)
      .first();

    // Retornar erro caso não tenha encontrado
    if (!user) return res.status(404).json({ error: Errors.NOT_FOUND });

    // Remover campos sensíveis
    const serializedUser = { ...user, password: undefined };

    return res.json(serializedUser);
  },

  async create(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Verificar se tem permissão
    if (req.user!.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Pegar dados do body
    let { nickname, email } = req.body as CreateAdminUserData;

    // Remover espaços
    if (nickname) nickname = nickname.trim();
    if (email) email = email.trim();

    // Fazer validação
    try {
      CreateAdminUserSchema.validateSync(
        { nickname, email },
        { abortEarly: false }
      );
    } catch (err) {
      return res
        .status(400)
        .json({ error: Errors.INVALID_REQUEST, errors: err.errors });
    }

    nickname = nickname!;
    email = email!;

    // Verificar se já existe um usuário com mesmo nickname/email
    const userAlreadyExist: AdminUserData | undefined = await conn(
      'admin_users'
    )
      .select('id')
      .where('identifier', nickname.toLowerCase())
      .orWhere('email', email.toLowerCase())
      .first();

    if (userAlreadyExist)
      return res.status(401).json({ error: Errors.INVALID_REQUEST });

    // Criar novo usuário
    const newUser = {
      id: uuid(),
      identifier: nickname.toLowerCase(),
      nickname: nickname,
      email: email.toLowerCase(),
      password: Password.hash(Password.random()),
      permission: 'admin',
    } as AdminUserData;

    await conn('admin_users').insert(newUser);

    /* Send Email with password */

    return res.status(201).json({ message: Success.CREATED });
  },

  async update(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Pegar identificador do usuário dos parâmetros de rota
    let { identifier } = req.params as { identifier?: string };
    identifier = identifier?.toLocaleLowerCase();

    // Verificar se tem permissão para executar
    if (req.user!.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Pegar dados do corpo da requisição
    let { nickname, email, permission } = req.body as UpdateAdminUserData;

    // Retornar erro caso não tenha dados para atualizar
    if (!nickname && !email && !permission)
      return res.status(400).json({ error: Errors.INVALID_REQUEST });

    // Remover espaços
    if (nickname) nickname = nickname.trim();
    if (email) email = email.trim();
    if (permission) permission = permission.trim();

    // Validar dados
    try {
      UpdateAdminUserSchema.validateSync(
        { nickname, email, permission },
        { abortEarly: false }
      );
    } catch (err) {
      return res
        .status(400)
        .json({ error: Errors.INVALID_REQUEST, errors: err.errors });
    }

    // Verificar disponibilidade do nickname
    if (nickname) {
      const userAlreadyExist: AdminUserData | undefined = await conn(
        'admin_users'
      )
        .select('id')
        .where('identifier', nickname.toLowerCase())
        .first();

      if (userAlreadyExist)
        return res.status(401).json({ error: Errors.INVALID_REQUEST });
    }

    // Novos dados para atualizar
    const newData = {
      identifier: nickname ? nickname.toLowerCase() : undefined,
      nickname: nickname,
      permission,
      email,
      updated_at: conn.fn.now() as any,
    } as AdminUserData;

    // Atualizar dados
    await conn('admin_users')
      .update(newData)
      .where('identifier', identifier || req.user!.nickname);

    return res.status(200).json({ message: Success.UPDATED });
  },

  async delete(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Pegar identificador do usuário dos parâmetros de rota
    let { identifier } = req.params as { identifier?: string };
    identifier = identifier?.toLowerCase();

    // Verificar se tem permissão para executar
    if (req.user!.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Verificar se o usuário existe
    const userExist: AdminUserData = await conn('admin_users')
      .select('*')
      .where('identifier', identifier || req.user!.nickname)
      .first();

    if (!userExist) return res.status(404).json({ error: Errors.NOT_FOUND });

    // Atualizar informações
    await conn('admin_users')
      .update({ updated_at: conn.fn.now(), deleted_at: conn.fn.now() })
      .where('identifier', identifier || req.user!.nickname);

    // Remover cookie com token
    if (!identifier) {
      res.cookie('token', '', {
        httpOnly: true,
        maxAge: 0,
        secure: process.env.NODE_ENV === 'production',
      });
    }

    // Adicionar token a blacklist
    /* To-Do */

    return res.status(202).json({ message: Success.DELETED });
  },
} as Controller;
