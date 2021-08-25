import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('products_commands', (table) => {
    table.string('id').primary();
    table.string('product_id').notNullable();
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.string('command').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('products_commands');
}
