import { v4 as uuid } from 'uuid';
import { ValidationError } from 'yup';

import conn from '../database/Connection';
import { Controller } from '../typings';
import { Errors, Success } from '../utils/Response';
import { CreateProductBenefitSchema, UpdateProductBenefitSchema } from '../utils/Validators';

interface BenefitBody {
  name?: string;
  description?: string;
}

export const ProductsBenefitsController = {
  async create(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Verificar permissões
    if (req.user?.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Dados recebidos
    const { name, description } = req.body as BenefitBody;

    // Validar dados
    try {
      CreateProductBenefitSchema.validateSync({ name, description }, { abortEarly: false });
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
      .where('deleted_at', null)
      .first();

    if (!productExists) return res.status(404).json({ error: Errors.NOT_FOUND });

    // Fazer o cast dos dados
    const data = CreateProductBenefitSchema.cast({ name, description });

    // Inserir dados
    await conn('products_benefits').insert({ ...data, id: uuid(), product_id });

    return res.status(201).json({ message: Success.CREATED });
  },

  async update(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Se não tiver permissão
    if (req.user?.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Pegar dados da requisição
    const { description, name } = req.body as BenefitBody;

    // Verificar se foram passados dados
    if (!description && !name) return res.status(400).json({ error: Errors.INVALID_REQUEST });

    // Verificar se os IDs passados são válidos
    const { product_id, benefit_id } = req.params;

    const [benefitExists, productExists] = await Promise.all([
      conn('products_benefits')
        .select('*')
        .where('id', benefit_id)
        .where('product_id', product_id)
        .where('deleted_at', null)
        .first(),
      conn('products').select('*').where('id', product_id).where('deleted_at', null).first(),
    ]);

    if (!benefitExists || !productExists) return res.status(404).json({ error: Errors.NOT_FOUND });

    // Validar dados
    try {
      UpdateProductBenefitSchema.validateSync({ description, name }, { abortEarly: false });
    } catch (err) {
      if (err instanceof ValidationError)
        return res.status(400).json({ error: Errors.INVALID_REQUEST });

      console.error(err);

      return res.status(500).json({ error: Errors.INTERNAL_ERROR });
    }

    // Formatar dados
    const data = UpdateProductBenefitSchema.cast({ description, name });

    await conn('products_benefits').update(data).where('id', benefit_id);

    return res.json({ message: Success.UPDATED });
  },

  async delete(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Se não tiver permissão
    if (req.user?.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Verificar se o ID existe
    const { product_id, benefit_id } = req.params;

    const [benefitExists, productExists] = await Promise.all([
      conn('products_benefits')
        .select('*')
        .where('id', benefit_id)
        .where('product_id', product_id)
        .where('deleted_at', null)
        .first(),
      conn('products').select('*').where('id', product_id).where('deleted_at', null).first(),
    ]);

    if (!benefitExists || !productExists) return res.status(404).json({ error: Errors.NOT_FOUND });

    // Remover dados
    const deletedField = `deleted_${Date.now().toString()}`;

    await conn('products_benefits')
      .update({
        name: deletedField,
        description: deletedField,
        deleted_at: conn.fn.now(),
      })
      .where('id', benefit_id);

    return res.json({ message: Success.DELETED });
  },
} as Controller;
