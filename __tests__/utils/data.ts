import { v4 as uuid } from 'uuid';

import conn from '../../src/database/Connection';
import Password from '../../src/utils/Password';

const alreadyExecuted = {
  users: false,
  servers: false,
  products: false,
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

/**
 * [0] - Deleted
 * [1] - Disabled
 * [2] - Active
 */
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

  const benefits = [],
    commands = [];

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
