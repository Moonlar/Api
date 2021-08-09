import { Knex } from 'knex';
import path from 'path';

interface DatabaseConfig {
  [key: string]: any;
  production: Knex.Config;
  test: Knex.Config;
  development: Knex.Config;
}

export const config: DatabaseConfig = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.resolve(__dirname, '..', 'database', 'database.sqlite'),
    },
    migrations: {
      directory: path.resolve(__dirname, '..', 'database', 'migrations'),
    },
    seeds: { directory: path.resolve(__dirname, '..', 'database', 'seeds') },
    useNullAsDefault: true,
  },
  test: {
    client: 'sqlite3',
    connection: ':memory:',
    migrations: {
      directory: path.resolve(__dirname, '..', 'database', 'migrations'),
    },
    seeds: { directory: path.resolve(__dirname, '..', 'database', 'seeds') },
    useNullAsDefault: true,
  },
  production: {
    client: 'postgres',
    version: process.env.DB_VERSION,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE,
    },
    migrations: {
      directory: path.resolve(__dirname, '..', 'database', 'migrations'),
    },
    seeds: { directory: path.resolve(__dirname, '..', 'database', 'seeds') },
  },
};
