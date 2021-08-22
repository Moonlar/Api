import conn from '../database/Connection';

import { AdminUserData, Controller } from '../typings';

export const AdminUsersController = {
  async show(req, res) {
    // Se não estiver conectado
    // if (!req.isAuth) return res.authError();

    // Se o nível de permissão não for manager
    if (req.user?.permission !== 'manager')
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
} as Controller;
