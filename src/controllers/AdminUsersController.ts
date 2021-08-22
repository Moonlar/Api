import { v4 as uuid } from 'uuid';

import conn from '../database/Connection';
import Password from '../utils/Password';
import { CreateAdminUserSchema } from '../utils/Validators';

import { AdminUserData, Controller } from '../typings';

interface CreateAdminUserData {
  nickname?: string;
  email?: string;
}

interface UpdateAdminUserData {
  nickname: string;
  email: string;
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
    const { nickname } = req.params as { nickname?: string };

    // Verificar se ele tem permissão para acessar estes dados
    if (nickname && req.user!.permission !== 'manager')
      return res
        .status(401)
        .json({ error: 'You do not have permission to access this feature' });

    // Buscar dados
    const user: AdminUserData = await conn('admin_users')
      .select('*')
      .where('nickname', nickname || req.user!.nickname)
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
        .json({ error: 'You do not have permission to perform this action.' });

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

    return res.status(201).json({ message: 'Successfully created account' });
  },
} as Controller;
