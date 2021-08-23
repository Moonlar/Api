import { v4 as uuid } from 'uuid';

import { AdminUserData } from '../../src/typings';
import Password from '../../src/utils/Password';

export const user = {
  id: uuid(),
  nickname: 'mxd_',
  display_name: 'MxD_',
  email: 'mxd@gmail.com',
  password: Password.hash('12345678'),
  permission: 'user' as any,
} as AdminUserData;

export const admin = {
  id: uuid(),
  nickname: 'admin',
  display_name: 'Admin',
  email: 'admin@gmail.com',
  password: Password.hash('12345678'),
  permission: 'admin',
} as AdminUserData;

export const manager = {
  id: uuid(),
  nickname: 'manager',
  display_name: 'Manager',
  email: 'manager@gmail.com',
  password: Password.hash('12345678'),
  permission: 'manager',
} as AdminUserData;
