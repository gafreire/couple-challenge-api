import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE user_auth_providers
    ADD CONSTRAINT fk_user_auth_providers_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE user_auth_providers DROP CONSTRAINT fk_user_auth_providers_user_id;
  `);
}