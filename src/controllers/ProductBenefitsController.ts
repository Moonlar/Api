import { v4 as uuid } from 'uuid';
import { ValidationError } from 'yup';

import conn from '../database/Connection';
import { Errors, Success } from '../utils/Response';
import { CreateProductBenefitSchema } from '../utils/Validators';

import { Controller } from '../typings';

interface CreateBenefitData {
  name?: string;
  description?: string;
}

export const ProductBenefitsController = {
  async create(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Verificar permissões
    if (req.user?.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Dados recebidos
    const { name, description } = req.body as CreateBenefitData;

    // Validar dados
    try {
      CreateProductBenefitSchema.validateSync(
        { name, description },
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
    const data = CreateProductBenefitSchema.cast({ name, description });

    // Inserir dados
    await conn('products_benefits').insert({ ...data, id: uuid(), product_id });

    return res.status(201).json({ message: Success.CREATED });
  },
} as Controller;