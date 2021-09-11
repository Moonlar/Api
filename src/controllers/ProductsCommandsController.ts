import { v4 as uuid } from 'uuid';
import { ValidationError } from 'yup';

import conn from '../database/Connection';
import { Errors, Success } from '../utils/Response';
import {
  CreateProductCommandSchema,
  UpdateProductCommandSchema,
} from '../utils/Validators';

import { Controller } from '../typings';

interface CommandBody {
  name?: string;
  command?: string;
}

export const ProductsCommandsController = {
  async create(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Verificar permissões
    if (req.user?.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Dados recebidos
    const { name, command } = req.body as CommandBody;

    // Validar dados
    try {
      CreateProductCommandSchema.validateSync(
        { name, command },
        { abortEarly: false }
      );
    } catch (err) {
      if (err instanceof ValidationError)
        return res.status(400).json({ error: Errors.INVALID_REQUEST });

      console.error(err);

      return res.status(500).json({ error: Errors.INTERNAL_ERROR });
    }

    // Verificar se o produto existe
    const { product_id } = req.params;

    const productExists: string | undefined = await conn('products')
      .select('id')
      .where('id', product_id)
      .first();

    if (!productExists)
      return res.status(404).json({ error: Errors.NOT_FOUND });

    // Fazer o cast dos dados
    const data = CreateProductCommandSchema.cast({ name, command });

    // Inserir dados
    await conn('products_commands').insert({ ...data, id: uuid(), product_id });

    return res.status(201).json({ message: Success.CREATED });
  },

  async update(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Se não tiver permissão
    if (req.user?.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Pegar dados da requisição
    const { command, name } = req.body as CommandBody;

    // Verificar se foram passados dados
    if (!command && !name)
      return res.status(400).json({ error: Errors.INVALID_REQUEST });

    // Verificar se o ID existe
    const { id } = req.params;

    const dataExist = await conn('products_commands')
      .select('*')
      .where('id', id)
      .first();

    if (!dataExist) return res.status(404).json({ error: Errors.NOT_FOUND });

    // Validar dados
    try {
      UpdateProductCommandSchema.validateSync(
        { command, name },
        { abortEarly: false }
      );
    } catch (err) {
      if (err instanceof ValidationError)
        return res.status(400).json({ error: Errors.INVALID_REQUEST });

      console.error(err);

      return res.status(500).json({ error: Errors.INTERNAL_ERROR });
    }

    // Formatar dados
    const data = UpdateProductCommandSchema.cast({ command, name });

    await conn('products_commands').update(data).where('id', id);

    return res.json({ message: Success.UPDATED });
  },

  async delete(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Se não tiver permissão
    if (req.user?.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Verificar se o ID existe
    const { id } = req.params;

    const dataExist = await conn('products_commands')
      .select('*')
      .where('id', id)
      .first();

    if (!dataExist) return res.status(404).json({ error: Errors.NOT_FOUND });

    // Remover dados
    const deletedField = 'deleted_' + Date.now().toString();

    await conn('products_commands')
      .update({
        name: deletedField,
        command: deletedField,
        deleted_at: conn.fn.now(),
      })
      .where('id', id);

    return res.json({ message: Success.DELETED });
  },
} as Controller;
