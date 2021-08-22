import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('purchases', (table) => {
    table.string('id').primary();
    table.string('status').notNullable();
    table.string('nickname').notNullable();
    table.string('server').notNullable();
    table.float('total').notNullable();
    table.float('discount').notNullable();
    table.timestamp('activated_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('purchases');
}
