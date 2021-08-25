import { v4 as uuid } from 'uuid';

import conn from '../database/Connection';
import { CreateServerSchema } from '../utils/Validators';

import { Controller, ServerData } from '../typings';

interface CreateServerData {
  title?: string;
  description?: string;
}

export const ServersController = {
  async show(req, res) {
    // Parâmetros de busca
    let page = Number(req.query.page || '1');
    let search = (req.query.search || '').toString();
    const limit = 10;

    // Informações
    const length = Number(
      (await conn('servers').count('id'))[0]['count(`id`)']
    );
    const pages = Math.ceil(length / limit) || 1;

    // Validar página de busca
    if (isNaN(page) || page <= 0) page = 1;

    if (page > pages) page = pages;

    // Buscar dados
    const servers: ServerData[] = await conn('servers')
      .select('*')
      .where('name', 'like', `%${search}%`)
      .offset((page - 1) * limit)
      .limit(limit);

    // Se tiver permissão admin ou manager retornar dados sem formatar
    if (req.isAuth && ['admin', 'manager'].includes(req.user!.permission)) {
      return res.json({
        page,
        total_pages: pages,
        total_servers: length,
        limit,
        servers: servers,
      });
    }

    // Retornar dados formatados
    const serializedServers = servers.filter(
      (server) => server.deleted_at === null
    );

    return res.json({
      page,
      total_pages: pages,
      total_servers: length,
      limit,
      servers: serializedServers,
    });
  },

  async create(req, res) {
    if (!req.isAuth) return res.authError();

    if (req.user?.permission !== 'manager')
      return res
        .status(401)
        .json({ error: 'You do not have permission to perform this action' });

    const { title, description } = req.body as CreateServerData;

    const bodyData = { title, description };
    let data: ServerData | undefined;

    try {
      CreateServerSchema.validateSync(bodyData, { abortEarly: false });

      data = CreateServerSchema.cast(bodyData) as any;
    } catch (err) {
      return res
        .status(400)
        .json({ error: 'Invalid body', errors: err.errors });
    }

    if (!data) return res.status(500).json({ error: 'Internal server error' });

    const serverExists: ServerData | undefined = await conn('servers')
      .select('id')
      .where('name', data.name)
      .first();

    if (serverExists)
      return res.status(401).json({ error: 'Server already exist' });

    data = {
      ...data,
      id: uuid(),
    };

    await conn('servers').insert(data);

    return res.status(201).json({ message: 'Criado' });
  },
} as Controller;
