import { v4 as uuid } from 'uuid';

import conn from '../../src/database/Connection';
import Password from '../../src/utils/Password';

let alreadyExecuted = {
  users: false,
  servers: false,
};

const usersData = [
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

const serversData = [
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
