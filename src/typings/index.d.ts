/* eslint-disable no-unused-vars */
import { Request, Response } from 'express';

export interface Controller {
  /**
   * Retornar dados específicos
   */
  index: (req: Request, res: Response) => Promise<any>;
  /**
   * Retornar lista de dados
   */
  show: (req: Request, res: Response) => Promise<any>;
  /**
   * Criar dados
   */
  create: (req: Request, res: Response) => Promise<any>;
  /**
   * Atualizar dados
   */
  update: (req: Request, res: Response) => Promise<any>;
  /**
   * Deletar dados
   */
  delete: (req: Request, res: Response) => Promise<any>;
}

export interface AdminUserData {
  id: string;
  identifier: string;
  nickname: string;
  email: string;
  password: string;
  permission: 'admin' | 'manager';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductData {
  id: string;
  name: string;
  description: string;
  image_url: string;
  server_id: string;
  price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BenefitData {
  id: string;
  product_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CommandData {
  id: string;
  product_id: string;
  name: string;
  description: string;
  command: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CouponData {
  id: string;
  code: string;
  name: string;
  description: string;
  discount: number;
  stats_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PurchaseData {
  id: string;
  status: 'pending' | 'completed' | 'cancelled' | 'activated';
  nickname: string;
  server: string;
  total: number;
  discount: number;
  activated_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PurchaseItemData {
  id: string;
  purchase_id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ServerData {
  id: string;
  identifier: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TokenData {
  nickname: string;
  permission: 'user' | AdminUserData['permission'];
}
