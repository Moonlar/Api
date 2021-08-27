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
      activated: false,
    } as ProductData;

    const benefitsData = data.benefits.map((benefit) => ({
      ...benefit,
      id: uuid(),
    })) as BenefitData[];

    const commandsData = data.commands.map((command) => ({
      ...command,
      id: uuid(),
    })) as CommandData[];

    // inserir dados
    const trx = await conn.transaction();

    await Promise.all([
      trx('products').insert(productData),
      trx('products_benefits').insert(benefitsData),
      trx('products_commands').insert(commandsData),
    ]);

    return res.status(201).json({ message: Success.CREATED });
  },
} as Controller;
