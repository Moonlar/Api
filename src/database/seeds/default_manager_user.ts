import { Knex } from 'knex';
import { v4 as uuid } from 'uuid';

import { AdminUserData } from '../../typings';
import Password from '../../utils/Password';

export async function seed(knex: Knex): Promise<void> {
  // Verificar se o usuário padrão já foi criado
  /* TO-DO: Alterar modo de verificação para count */
  const userExist = await knex('admin_users')
    .select('*')
    .where('identifier', 'default')
    .first();

  if (userExist) return;

  const defaultUser = {
    id: uuid(),
    identifier: 'default',
    nickname: 'Default',
    email: 'default@gmail.com',
    password: Password.hash('12345678'),
    permission: 'manager',
  } as AdminUserData;

  // Inserts seed entries
  await knex('admin_users').insert(defaultUser);
}
