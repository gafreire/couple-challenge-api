import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE users 
    ADD COLUMN couple_id UUID;

    CREATE INDEX idx_users_couple_id ON users(couple_id);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE users 
    DROP COLUMN couple_id;
  `);
}