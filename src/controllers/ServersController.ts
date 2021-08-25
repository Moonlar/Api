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
    const servers: ServerData[] = await conn('servers').select('*');

    if (req.isAuth && req.user?.permission === 'admin') {
      return res.json(servers);
    }

    const serializedServers = servers.filter(
      (server) => server.deleted_at === null
    );

    return res.json(serializedServers);
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
