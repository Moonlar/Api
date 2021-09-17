import { v4 as uuid } from 'uuid';
import { ValidationError } from 'yup';

import conn from '../database/Connection';
import { Controller, CouponData } from '../typings';
import { Errors, Success } from '../utils/Response';
import { CreateCouponSchema, UpdateCouponSchema } from '../utils/Validators';

interface CreateCouponData {
  code: string;
  name: string;
  description: string;
  discount: number;
  starts_at: Date;
  ends_at: Date;
}

interface UpdateCouponData {
  code?: string;
  name?: string;
  description?: string;
  discount?: number;
  starts_at?: Date;
  ends_at?: Date;
}

export const CouponsController = {
  async show(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Verificar permissão
    if (!['admin', 'manager'].includes(req.user!.permission))
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Parâmetros de busca
    let page = Number(req.query.page || '1');
    const search = (req.query.search || '').toString();
    const limit = 10;

    // Informações
    const length = Number(
      (
        await conn('coupons')
          .count('id')
          .where('name', 'like', `%${search}%`)
          .where('deleted_at', null)
      )[0]['count(`id`)'],
    );
    const pages = Math.ceil(length / limit) || 1;

    // Validar página de busca
    if (Number.isNaN(page) || page <= 0) page = 1;

    if (page > pages) page = pages;

    // Buscar dados
    const coupons: CouponData[] = await conn('coupons')
      .select('*')
      .where('name', 'like', `%${search}%`)
      .where('deleted_at', null)
      .offset((page - 1) * limit)
      .limit(limit);

    return res.json({
      page,
      total_pages: pages,
      total_coupons: length,
      limit,
      coupons,
    });
  },

  async index(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Pegar código do cupom
    const { code } = req.params;

    // Buscar dados
    const coupon: CouponData | undefined = await conn('coupons')
      .select('*')
      .where('code', code)
      .where('deleted_at', null)
      .first();

    // Se não for encontrado
    if (!coupon) return res.status(404).json({ error: Errors.NOT_FOUND });

    // Retornar dados
    return res.json({ ...coupon, deleted_at: undefined });
  },

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

  async update(req, res) {
    // Se não estiver conectado
    if (!req.isAuth) return res.authError();

    // Verificar permissão
    if (req.user?.permission !== 'manager')
      return res.status(401).json({ error: Errors.NO_PERMISSION });

    // Verificar se o cupom existe
    const { code: identifier } = req.params;

    const couponExist: { id: string } | undefined = await conn('coupons')
      .select('id')
      .where('code', identifier)
      .where('deleted_at', null)
      .first();

    if (!couponExist) return res.status(404).json({ error: Errors.NOT_FOUND });

    // Verificar dados
    const { code, description, discount, ends_at, name, starts_at } = req.body as UpdateCouponData;

    if (!code && !description && !discount && !ends_at && !name && !starts_at)
      return res.status(400).json({ error: Errors.INVALID_REQUEST });

    // Validar dados
    const bodyData = { code, description, discount, ends_at, name, starts_at };

    try {
      UpdateCouponSchema.validateSync(bodyData, { abortEarly: false });
    } catch (err: any) {
      if (err instanceof ValidationError)
        return res.status(400).json({ error: Errors.INVALID_REQUEST });

      console.log(err);

      return res.status(500).json({ error: Errors.INTERNAL_ERROR });
    }

    // Atualizar dados
    await conn.update(bodyData).where('id', couponExist.id).where('deleted_at', null);

    return res.json({ message: Success.UPDATED });
  },
} as Controller;
