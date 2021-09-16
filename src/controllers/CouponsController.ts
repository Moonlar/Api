import { v4 as uuid } from 'uuid';
import { ValidationError } from 'yup';

import conn from '../database/Connection';
import { Controller } from '../typings';
import { Errors, Success } from '../utils/Response';
import { CreateCouponSchema } from '../utils/Validators';

interface CreateCouponData {
  code: string;
  name: string;
  description: string;
  discount: number;
  starts_at: Date;
  ends_at: Date;
}

export const CouponsController = {
  async create(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Verificar se tem permissão
    if (req.user?.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Validar dados recebidos
    const { code, name, description, discount, starts_at, ends_at } = req.body as CreateCouponData;
    const bodyData = { code, name, description, discount, starts_at, ends_at };

    try {
      CreateCouponSchema.validateSync(bodyData, { abortEarly: false });
    } catch (err: any) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ error: Errors.INVALID_REQUEST });
      }

      console.log(err);

      return res.status(500).json({ error: Errors.INTERNAL_ERROR });
    }

    // Formatar dados
    const data: CreateCouponData = CreateCouponSchema.cast(bodyData) as any;

    // Validar datas de início e fim do cupom
    if (data.ends_at.getTime() <= data.starts_at.getTime())
      return res.status(400).json({ error: Errors.INVALID_REQUEST });

    // Validar se código já está em uso
    const codeExists: { code: string } | undefined = await conn('coupons')
      .select('code')
      .where('code', data.code)
      .where('deleted_at', null)
      .first();

    if (codeExists) return res.status(400).json({ error: Errors.INVALID_REQUEST });

    // Criar cupom
    await conn('coupons').insert({
      ...data,
      id: uuid(),
      starts_at: data.starts_at.toISOString(),
      ends_at: data.ends_at.toISOString(),
    });

    return res.status(201).json({ message: Success.CREATED });
  },
} as Controller;
