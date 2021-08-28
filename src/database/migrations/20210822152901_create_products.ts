import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('products', (table) => {
    table.string('id').primary();
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.string('image_url');
    table
      .string('server_id')
      .references('id')
      .inTable('servers')
      .onDelete('CASCADE');
    table.float('price').notNullable();
    table.boolean('active').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('products');
}
