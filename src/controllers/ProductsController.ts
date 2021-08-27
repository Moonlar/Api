import { v4 as uuid } from 'uuid';

import conn from '../database/Connection';
import { CreateProductSchema } from '../utils/Validators';
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
  server: string;
  price: number;
  benefits: {
    name: string;
    description: string;
  }[];
  commands: {
    name: string;
    description: string;
    command: string;
  }[];
}

export const ProductsController = {
  async show(req, res) {
    const isAdmin = ['admin', 'manager'].includes(req.user?.permission || '');

    const products: ProductData[] = await conn('products').select('*');
    const productsIds = products.map((product) => product.id);
    const serversIds = products.map((product) => product.server);

    const benefits: BenefitData[] = await conn('products_benefits as pb')
      .innerJoin('products as p', 'pb.product_id', 'p.id')
      .select('pb.*')
      .whereIn('pb.product_id', productsIds);

    console.log(
      conn('products_benefits as pb')
        .innerJoin('products as p', 'pb.product_id', 'p.id')
        .select('pb.*')
        .whereIn('pb.product_id', productsIds)
        .toQuery()
    );

    const commands: CommandData[] = isAdmin
      ? await conn('products_commands as pc')
          .innerJoin('products as p', 'pc.product_id', 'p.id')
          .select('pc.*')
          .whereIn('pc.product_id', productsIds)
      : [];

    const servers: ServerData[] = await conn('servers')
      .select(['id', 'name', 'description'])
      .whereIn('id', serversIds);

    const serializedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      image_url: product.image_url,
      server: servers.find((server) => server.id === product.server) || null,
      benefits: benefits.filter((benefit) => benefit.product_id === product.id),
      commands: isAdmin
        ? commands.filter((command) => command.product_id === product.id)
        : undefined,
      price: product.price,
      created_at: product.created_at,
      updated_at: product.updated_at,
      deleted_at: product.deleted_at,
    }));

    return res.json(serializedProducts);
  },

  async index(req, res) {
    return res.json(null);
  },

  async create(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Verificar se tem permissão
    if (req.user?.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Dados da requisição
    const { name, benefits, commands, description, image_url, price, server } =
      req.body as CreateProductData;

    const bodyData = {
      name,
      benefits,
      commands,
      description,
      image_url,
      price,
      server,
    };

    // Dados formatados
    let data: CreateProductData | undefined;

    // Validar dados
    try {
      CreateProductSchema.validateSync(bodyData, { abortEarly: false });

      data = CreateProductSchema.cast(bodyData) as any;
    } catch (err) {
      return res
        .status(400)
        .json({ error: Errors.INVALID_REQUEST, errors: err.errors });
    }

    // Se o cast dos dados falhar
    if (!data) return res.status(500).json({ error: Errors.INTERNAL_ERROR });

    // Validar id do servidor de relacionamento
    const serverExists: ServerData | undefined = await conn('servers')
      .select('id')
      .where('id', server)
      .first();

    if (!serverExists)
      return res.json(404).json({ error: Errors.INVALID_REQUEST });

    // Dados a serem inseridos
    const productData = {
      id: uuid(),
      name: data.name,
      description: data.description,
      price: data.price,
      image_url: data.image_url,
      server: data.server,
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
} as Controller;
