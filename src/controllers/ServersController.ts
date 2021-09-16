import { v4 as uuid } from 'uuid';

import conn from '../database/Connection';
import { CreateServerSchema, UpdateServerSchema } from '../utils/Validators';
import { Errors, Success } from '../utils/Response';

import { Controller, ServerData } from '../typings';

interface CreateServerData {
  name?: string;
  description?: string;
}

interface UpdateServerData {
  name?: string;
  description?: string;
}

export const ServersController = {
  async show(req, res) {
    // Parâmetros de busca
    let page = Number(req.query.page || '1');
    const search = (req.query.search || '').toString();
    const limit = 10;

    // Informações
    const length = Number(
      (
        await conn('servers')
          .count('id')
          .where('deleted_at', null)
          .where('name', 'like', `%${search}%`)
      )[0]['count(`id`)'],
    );
    const pages = Math.ceil(length / limit) || 1;

    // Validar página de busca
    if (Number.isNaN(page) || page <= 0) page = 1;

    if (page > pages) page = pages;

    // Buscar dados
    const servers: ServerData[] = await conn('servers')
      .select('*')
      .where('name', 'like', `%${search}%`)
      .where('deleted_at', null)
      .offset((page - 1) * limit)
      .limit(limit);

    return res.json({
      page,
      total_pages: pages,
      total_servers: length,
      limit,
      servers,
    });
  },

  async index(req, res) {
    // Parâmetros de busca
    const { id } = req.params as { id: string };

    // Buscar dados
    const server: ServerData | undefined = await conn('servers')
      .select('*')
      .where('id', id)
      .where('deleted_at', null)
      .first();

    // Caso não ache o servidor
    if (!server) {
      return res.status(404).json({ error: Errors.NOT_FOUND });
    }

    return res.json(server);
  },

  async create(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Se não tiver permissão manager
    if (req.user?.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Dados do corpo da requisição
    const { name, description } = req.body as CreateServerData;

    const bodyData = { name, description, identifier: name?.toLowerCase() };
    let data: ServerData | undefined; // Dados já validados e formatado

    // Validar dados
    try {
      CreateServerSchema.validateSync(bodyData, { abortEarly: false });

      data = CreateServerSchema.cast(bodyData) as any;
    } catch (err: any) {
      return res.status(400).json({ error: Errors.INVALID_REQUEST, errors: err.errors });
    }

    // Caso o cast falhe
    if (!data) return res.status(500).json({ error: Errors.INTERNAL_ERROR });

    // Verificar se o nome do servidor já está em uso
    const serverExists: ServerData | undefined = await conn('servers')
      .select('id')
      .where('identifier', data.name.toLowerCase())
      .first();

    if (serverExists) return res.status(400).json({ error: Errors.INVALID_REQUEST });

    // Dados para inserir no banco de dados
    data = {
      ...data,
      id: uuid(),
    };

    await conn('servers').insert(data);

    return res.status(201).json({ message: Success.CREATED });
  },

  async update(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Verificar permissões
    if (req.user?.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Dados para atualizar
    const { name, description } = req.body as UpdateServerData;

    // Se não for fornecido dados para atualizar
    if (!name && !description) return res.status(400).json({ error: Errors.INVALID_REQUEST });

    const { id } = req.params as { id: string };

    // Verificar se o servidor existe
    const serverExists: { id: string } | undefined = await conn('servers')
      .select('id')
      .where('id', id)
      .where('deleted_at', null)
      .first();

    if (!serverExists) return res.status(404).json({ error: Errors.NOT_FOUND });

    // Validar dados
    let data: UpdateServerData | undefined;

    try {
      UpdateServerSchema.validateSync({ name, description }, { abortEarly: false });

      data = UpdateServerSchema.cast({ name, description }) as any;
    } catch (err: any) {
      return res.status(400).json({ error: Errors.INVALID_REQUEST, errors: err.errors });
    }

    // Caso o cast falhe
    if (!data) return res.status(500).json({ error: Errors.INTERNAL_ERROR });

    // Verificar se o name já existe
    if (data.name) {
      const nameInUse = await conn('servers')
        .select('id')
        .where('identifier', data.name.toLowerCase())
        .first();

      if (nameInUse) return res.status(400).json({ error: Errors.INVALID_REQUEST });
    }

    // Atualizar dados
    await conn('servers')
      .update({ ...data, identifier: data.name?.toLowerCase() })
      .where('id', id);

    return res.json({ message: Success.UPDATED });
  },

  async delete(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Verificar se tem permissão para executar
    if (req.user!.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    const { id } = req.params as { id: string };

    // Verificar se o servidor existe
    const serverExist: ServerData | undefined = await conn('servers')
      .select('*')
      .where('id', id)
      .where('deleted_at', null)
      .first();

    if (!serverExist) return res.status(404).json({ error: Errors.NOT_FOUND });

    // Atualizar informações
    await conn('servers')
      .update({
        name: `deleted_${Date.now().toString()}`,
        description: `deleted_${Date.now().toString()}`,
        updated_at: conn.fn.now(),
        deleted_at: conn.fn.now(),
      })
      .where('id', id);

    return res.status(200).json({ message: Success.DELETED });
  },
} as Controller;
