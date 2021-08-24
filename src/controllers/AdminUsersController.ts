import { v4 as uuid } from 'uuid';

import conn from '../database/Connection';
import Password from '../utils/Password';
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
      return res
        .status(401)
        .json({ error: 'You do not have permission to access this' });

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
    let { id } = req.params as { id?: string };
    id = id?.toLowerCase();

    // Verificar se ele tem permissão para acessar estes dados
    if (id && req.user!.permission !== 'manager')
      return res
        .status(401)
        .json({ error: 'You do not have permission to access this feature' });

    // Buscar dados
    const user: AdminUserData = await conn('admin_users')
      .select('*')
      .where('nickname', id ? id : req.user!.nickname)
      .first();

    // Retornar erro caso não tenha encontrado
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Remover campos sensíveis
    const serializedUser = { ...user, password: undefined };

    return res.json(serializedUser);
  },

  async create(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Verificar se tem permissão
    if (req.user!.permission !== 'manager')
      return res
        .status(401)
        .json({ error: 'You do not have permission to perform this action' });

    // Pegar dados do body
    let { nickname, email } = req.body as CreateAdminUserData;

    // Remover espaços
    (nickname = (nickname || '').trim()), (email = (email || '').trim());

    // Fazer validação
    try {
      CreateAdminUserSchema.validateSync(
        { nickname, email },
        { abortEarly: false }
      );
    } catch (err) {
      return res
        .status(400)
        .json({ error: 'Invalid body', errors: err.errors });
    }

    // Verificar se já existe um usuário com mesmo nickname/email
    const userAlreadyExist: AdminUserData | undefined = await conn(
      'admin_users'
    )
      .select('id')
      .where('nickname', nickname.toLowerCase())
      .orWhere('email', email.toLowerCase())
      .first();

    if (userAlreadyExist)
      return res.status(401).json({ error: 'User already exist' });

    // Criar novo usuário
    const newUser = {
      id: uuid(),
      nickname: nickname.toLowerCase(),
      display_name: nickname,
      email: email.toLowerCase(),
      password: Password.hash(Password.random()),
      permission: 'admin',
    } as AdminUserData;

    await conn('admin_users').insert(newUser);

    return res.status(201).json({ message: 'User created successfully' });
  },

  async update(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Pegar id dos parâmetros de rota
    let { id } = req.params as { id?: string };
    id = id?.toLocaleLowerCase();

    // Verificar se tem permissão para executar
    if (req.user!.permission !== 'manager')
      return res
        .status(401)
        .json({ error: 'You do not have permission to access this feature' });

    // Pegar dados do corpo da requisição
    let { nickname, email, permission } = req.body as UpdateAdminUserData;

    // Retornar erro caso não tenha dados para atualizar
    if (!nickname && !email && !permission)
      return res.status(400).json({ error: 'No data to update' });

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
        .json({ error: 'Invalid body', errors: err.errors });
    }

    // Verificar disponibilidade do nickname
    if (nickname) {
      const userAlreadyExist: AdminUserData | undefined = await conn(
        'admin_users'
      )
        .select('id')
        .where('nickname', nickname.toLowerCase())
        .first();

      if (userAlreadyExist)
        return res.status(401).json({ error: 'Nickname already exist' });
    }

    // Novos dados para atualizar
    const newData = {
      nickname: nickname ? nickname.toLowerCase() : undefined,
      display_name: nickname,
      permission,
      email,
      updated_at: conn.fn.now() as any,
    } as AdminUserData;

    // Atualizar dados
    await conn('admin_users')
      .update(newData)
      .where('nickname', id || req.user!.nickname);

    return res.status(200).json({ message: 'User update successfully' });
  },

  async delete(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Pegar id dos parâmetros de rota
    let { id } = req.params as { id?: string };
    id = id?.toLowerCase();

    // Verificar se tem permissão para executar
    if (req.user!.permission !== 'manager')
      return res
        .status(401)
        .json({ error: 'You do not have permission to access this feature' });

    // Verificar se o usuário existe mesmo
    const userExist: AdminUserData = await conn('admin_users')
      .select('*')
      .where(id ? 'id' : 'nickname', id || req.user!.nickname)
      .first();

    if (!userExist) return res.status(404).json({ error: 'User not found' });

    // Atualizar informações
    await conn('admin_users')
      .update({ updated_at: conn.fn.now(), deleted_at: conn.fn.now() })
      .where('id', id || req.user!.nickname);

    // Remover cookie com token
    if (!id) {
      res.cookie('token', '', {
        httpOnly: true,
        maxAge: 0,
        secure: process.env.NODE_ENV === 'production',
      });
    }

    // Adicionar token a blacklist
    /* To-Do */

    return res.status(202).json({ message: 'Account successfully deleted' });
  },
} as Controller;
