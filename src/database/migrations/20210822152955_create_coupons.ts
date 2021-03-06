import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('coupons', (table) => {
    table.string('id').primary();
    table.string('code').notNullable().unique();
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.float('discount').notNullable();
    table.timestamp('starts_at').notNullable();
    table.timestamp('ends_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('coupons');
}
