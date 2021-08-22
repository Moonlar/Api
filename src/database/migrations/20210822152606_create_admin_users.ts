import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('admin_users', (table) => {
    table.string('id').primary();
    table.string('nickname').notNullable().unique();
    table.string('display_name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('permission').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('admin_users');
}
