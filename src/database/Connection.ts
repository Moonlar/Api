import knex from 'knex';

import { config } from '../config/database';

const connection = knex(config[process.env.NODE_ENV || 'development']);

export async function runMigrations() {
  return connection.migrate.latest();
}

export async function runSeeds() {
  return connection.seed.run();
}

export default connection;
