import { v4 as uuid } from 'uuid';

import conn from '../database/Connection';
import { CreateProductSchema, UpdateProductSchema } from '../utils/Validators';
import { Errors, Success } from '../utils/Response';

import {
  BenefitData,
  CommandData,
  Controller,
  ProductData,
  ServerData,
} from '../typings';

interface CreateProductData {
  name: string;
  description: string;
  image_url: string;
  server_id: string;
  price: number;
  benefits: {
    name: string;
    description: string;
  }[];
  commands: {
    name: string;
    command: string;
  }[];
}

interface UpdateProductData {
  name?: string;
  description?: string;
  image_url?: string;
  server_id?: string;
  price?: number;
  active?: boolean;
}

export const ProductsController = {
  async show(req, res) {
    // Parâmetros de busca
    let page = Number(req.query.page || '1');
    let search = (req.query.search || '').toString();
    const limit = 10;

    const isAdmin = ['admin', 'manager'].includes(req.user?.permission || '');

    // Informações
    const length = Number(
      isAdmin
        ? (
            await conn('products')
              .count('id')
              .where('name', 'like', `%${search}%`)
              .where('deleted_at', null)
          )[0]['count(`id`)']
        : (
            await conn('products')
              .count('id')
              .where('active', true)
              .where('name', 'like', `%${search}%`)
              .where('deleted_at', null)
          )[0]['count(`id`)']
    );
    const pages = Math.ceil(length / limit) || 1;

    // Validar página de busca
    if (isNaN(page) || page <= 0) page = 1;

    if (page > pages) page = pages;

    // Buscar dados
    const products: ProductData[] = await conn('products')
      .select('*')
      .where('deleted_at', null)
      .where('name', 'like', `%${search}%`)
      .whereIn('active', isAdmin ? [true, false] : [true])
      .offset((page - 1) * limit)
      .limit(limit);

    // ID de todos os servidores para relacionamento
    const serversIds = products.map((product) => product.server_id);

    // Servidores dos produtos
    const servers: ServerData[] = await conn('servers')
      .select(['id', 'name', 'description'])
      .whereIn('id', serversIds);

    // Formatar produtos
    const serializedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      image_url: product.image_url,
      price: product.price,
      active: isAdmin ? product.active : undefined,
      server_id: undefined,
      server: servers.find((server) => server.id === product.server_id) || null,
      created_at: product.created_at,
      updated_at: product.updated_at,
      deleted_at: product.deleted_at,
    }));

    // Retornar dados
    return res.json({
      page,
      total_pages: pages,
      total_products: length,
      limit,
      products: serializedProducts,
    });
  },

  async index(req, res) {
    const isAdmin = ['admin', 'manager'].includes(req.user?.permission || '');
    const { id } = req.params as { id: string };

    // Buscar produto
    const product: ProductData | undefined = await conn('products')
      .select('*')
      .where('id', id)
      .where('deleted_at', null)
      .whereIn('active', isAdmin ? [true, false] : [true])
      .first();

    // Se não encontrar
    if (!product) return res.status(404).json({ error: Errors.NOT_FOUND });

    // Benefícios dos produtos
    const benefits: BenefitData[] = await conn('products_benefits')
      .select(['id', 'name', 'description'])
      .where('product_id', id);

    // Commandos de ativação dos produtos
    const commands: CommandData[] = isAdmin
      ? await conn('products_commands')
          .select(['id', 'name', 'command'])
          .where('product_id', id)
      : [];

    // Servidor do produto
    const server = await conn('servers')
      .select(['id', 'name', 'description'])
      .where('id', product.server_id)
      .first();

    // Retornar dados formatados
    return res.json({
      id: product.id,
      name: product.name,
      description: product.description,
      image_url: product.image_url,
      price: product.price,
      active: isAdmin ? product.active : undefined,
      server_id: undefined,
      server,
      benefits,
      commands: isAdmin ? commands : undefined,
      created_at: product.created_at,
      updated_at: product.updated_at,
      deleted_at: product.deleted_at,
    });
  },

  async create(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Verificar se tem permissão
    if (req.user?.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Dados da requisição
    const {
      name,
      benefits,
      commands,
      description,
      image_url,
      price,
      server_id,
    } = req.body as CreateProductData;

    const requestData = {
      name,
      benefits,
      commands,
      description,
      image_url,
      price,
      server_id,
    };

    // Dados formatados
    let data: CreateProductData;

    // Validar dados
    try {
      CreateProductSchema.validateSync(requestData, { abortEarly: false });
    } catch (err: any) {
      return res
        .status(400)
        .json({ error: Errors.INVALID_REQUEST, errors: err.errors });
    }

    data = CreateProductSchema.cast(requestData) as any;

    // Validar id do servidor de relacionamento
    const serverExists: ServerData | undefined = await conn('servers')
      .select('id')
      .where('id', server_id)
      .first();

    if (!serverExists)
      return res.status(400).json({ error: Errors.INVALID_REQUEST });

    // Dados a serem inseridos
    const productData = {
      id: uuid(),
      name: data.name,
      description: data.description,
      price: data.price,
      image_url: data.image_url,
      server_id: data.server_id,
    } as ProductData;

    const benefitsData = data.benefits.map((benefit) => ({
      ...benefit,
      id: uuid(),
      product_id: productData.id,
    })) as BenefitData[];

    const commandsData = data.commands.map((command) => ({
      ...command,
      id: uuid(),
      product_id: productData.id,
    })) as CommandData[];

    // inserir dados
    const trx = await conn.transaction();

    try {
      await Promise.all([
        conn('products').transacting(trx).insert(productData),
        benefitsData.length > 0
          ? conn('products_benefits').transacting(trx).insert(benefitsData)
          : undefined,
        commandsData.length > 0
          ? conn('products_commands').transacting(trx).insert(commandsData)
          : undefined,
      ]);

      await trx.commit();
    } catch (err) {
      await trx.rollback();

      console.error(err);

      return res.status(500).json({ error: Errors.INTERNAL_ERROR });
    }

    return res.status(201).json({ message: Success.CREATED });
  },

  async update(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Verificar permissões
    if (req.user?.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Dados para atualizar
    const { name, description, image_url, server_id, active, price } =
      req.body as UpdateProductData;

    // Se não for fornecido dados para atualizar
    if (!name && !description && !image_url && !server_id && !active && !price)
      return res.status(400).json({ error: Errors.INVALID_REQUEST });

    const { id } = req.params as { id: string };

    // Verificar se o servidor existe
    const productExists: { id: string } | undefined = await conn('products')
      .select('id')
      .where('id', id)
      .where('deleted_at', null)
      .first();

    if (!productExists)
      return res.status(404).json({ error: Errors.NOT_FOUND });

    // Validar dados
    let data: UpdateProductData | undefined;
    const bodyData = {
      name,
      description,
      image_url,
      server_id,
      active,
      price,
    };

    try {
      UpdateProductSchema.validateSync(bodyData, { abortEarly: false });
    } catch (err: any) {
      return res
        .status(400)
        .json({ error: Errors.INVALID_REQUEST, errors: err.errors });
    }

    data = UpdateProductSchema.cast(bodyData) as any;

    // Atualizar dados
    await conn('products').where('id', id).update(data);

    return res.json({ message: Success.UPDATED });
  },

  async delete(req, res) {
    if (!req.isAuth) return res.authError();

    // Se não tiver permissão
    if (req.user?.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    const { id } = req.params;

    // Verificar se o produto existe
    const productExist = await conn('products')
      .select('id')
      .where('id', id)
      .where('deleted_at', null);

    if (!productExist) return res.status(404).json({ error: Errors.NOT_FOUND });

    // String que vai substituir dados originais
    const deletedField = 'deleted_' + Date.now();

    // Atualizar dados
    const trx = await conn.transaction();

    try {
      await Promise.all([
        trx('product')
          .update({
            name: deletedField,
            description: deletedField,
            price: 0,
            active: false,
            server_id: deletedField,
            image_url: deletedField,
            deleted_at: conn.fn.now(),
          })
          .where('id', id),
        trx('product_benefits')
          .update({
            name: deletedField,
            description: deletedField,
            deleted_at: conn.fn.now(),
          })
          .where('product_id', id),
        trx('product_commands')
          .update({
            name: deletedField,
            command: deletedField,
            deleted_at: conn.fn.now(),
          })
          .where('product_id', id),
      ]);

      await trx.commit();
    } catch (err) {
      trx.rollback();

      console.log(err);

      return res.json({ error: Errors.INTERNAL_ERROR });
    }

    return res.json({ message: Success.DELETED });
  },
} as Controller;
