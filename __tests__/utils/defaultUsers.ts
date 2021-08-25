import { v4 as uuid } from 'uuid';

import conn from '../../src/database/Connection';
import Password from '../../src/utils/Password';

let alreadyExecuted = false;

const data = [
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

export const createDefaultUsers = () => {
  if (process.env.NODE_ENV !== 'test' || alreadyExecuted) return;

  alreadyExecuted = true;

  return conn('admin_users').insert(data);
};
