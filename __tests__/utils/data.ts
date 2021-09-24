import { v4 as uuid } from 'uuid';

import conn from '../../src/database/Connection';
import Password from '../../src/utils/Password';

interface TestCouponData {
  id: string;
  code: string;
  name: string;
  description: string;
  discount: number;
  starts_at: string;
  ends_at: string;
  deleted_at?: string;
}

const alreadyExecuted = {
  users: false,
  servers: false,
  products: false,
  coupons: false,
};

const usersData = [
  {
    id: uuid(),
    identifier: 'deleted',
    nickname: 'Deleted',
    email: 'deleted@gmail.com',
    password: Password.hash('12345678'),
    permission: 'admin',
    deleted_at: conn.fn.now(),
  },
  {
    id: uuid(),
    identifier: 'admin',
    nickname: 'Admin',
    email: 'admin@gmail.com',
    password: Password.hash('12345678'),
    permission: 'admin',
  },
  {
    id: uuid(),
    identifier: 'manager',
    nickname: 'Manager',
    email: 'manager@gmail.com',
    password: Password.hash('12345678'),
    permission: 'manager',
  },
];

export const serversData = [
  {
    id: uuid(),
    identifier: 'rankup',
    name: 'RankUP',
    description: 'Servidor de RankUP',
    deleted_at: conn.fn.now(),
  },
  {
    id: uuid(),
    identifier: 'survival',
    name: 'Survival',
    description: 'Servidor de Survival',
  },
];

export const productsData = [
  {
    id: uuid(),
    name: 'deleted_1',
    description: 'deleted_1',
    server_id: serversData[1].id,
    price: 50,
    active: false,
    deleted_at: conn.fn.now(),
  },
  {
    id: uuid(),
    name: 'Product 1',
    description: 'Product 1',
    server_id: serversData[1].id,
    price: 50,
    active: false,
  },
  {
    id: uuid(),
    name: 'Product 2',
    description: 'Product 2',
    server_id: serversData[1].id,
    price: 50,
    active: true,
  },
];

const now = Date.now();
const oneDay = 1000 * 60 * 60 * 24;

export const couponsData: { [key: string]: TestCouponData } = {
  deleted: {
    id: uuid(),
    code: 'DEL',
    name: 'Cupom removido',
    description: 'Cupom que foi removido',
    discount: 0.5,
    starts_at: new Date(now).toISOString(),
    ends_at: new Date(now + oneDay).toISOString(),
    deleted_at: conn.fn.now() as any,
  },
  active: {
    id: uuid(),
    code: 'ACT',
    name: 'Cupom ativo',
    description: 'Cupom que ainda está ativo',
    discount: 0.5,
    starts_at: new Date(now).toISOString(),
    ends_at: new Date(now + oneDay).toISOString(),
  },
  inactive: {
    id: uuid(),
    code: 'INA',
    name: 'Cupom removido',
    description: 'Cupom que foi removido',
    discount: 0.5,
    starts_at: new Date(now - oneDay).toISOString(),
    ends_at: new Date(now).toISOString(),
  },
};

const getProductRelated = (id: string) => ({
  benefits: [
    {
      id: uuid(),
      product_id: id,
      name: 'Benefit 1',
      description: 'Benefit 1',
    },
    {
      id: uuid(),
      product_id: id,
      name: 'Benefit 2',
      description: 'Benefit 2',
    },
    {
      id: uuid(),
      product_id: id,
      name: 'Benefit 3',
      description: 'Benefit 3',
      deleted_at: conn.fn.now(),
    },
  ],
  commands: [
    {
      id: uuid(),
      product_id: id,
      name: 'Command 1',
      command: 'command 1',
    },
    {
      id: uuid(),
      product_id: id,
      name: 'Command 2',
      command: 'command 2',
    },
    {
      id: uuid(),
      product_id: id,
      name: 'Command 3',
      command: 'command 3',
      deleted_at: conn.fn.now(),
    },
  ],
});

export const createDefaultUsers = () => {
  if (process.env.NODE_ENV !== 'test' || alreadyExecuted.users) return;

  alreadyExecuted.users = true;

  return conn('admin_users').insert(usersData);
};

export const createDefaultServers = () => {
  if (process.env.NODE_ENV !== 'test' || alreadyExecuted.servers) return;

  alreadyExecuted.servers = true;

  return conn('servers').insert(serversData);
};

export const createDefaultProducts = () => {
  if (process.env.NODE_ENV !== 'test' || alreadyExecuted.products) return;

  alreadyExecuted.products = true;

  const benefits: {
    id: string;
    name: string;
    description: string;
    product_id: string;
  }[] = [];
  const commands: {
    id: string;
    name: string;
    command: string;
    product_id: string;
  }[] = [];

  productsData.forEach(({ id }, index) => {
    if (index === 0) return;

    const data = getProductRelated(id);

    benefits.push(...data.benefits);
    commands.push(...data.commands);
  });

  return Promise.all([
    conn('products').insert(productsData),
    conn('products_benefits').insert(benefits),
    conn('products_commands').insert(commands),
  ]);
};

export const createDefaultCoupons = () => {
  if (process.env.NODE_ENV !== 'test' || alreadyExecuted.coupons) return;

  alreadyExecuted.coupons = true;

  const data: TestCouponData[] = [];

  Object.entries(couponsData).forEach(([, value]) => {
    data.push(value);
  });

  return conn('coupons').insert(data);
};
