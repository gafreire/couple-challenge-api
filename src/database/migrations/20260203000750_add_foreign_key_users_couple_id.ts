import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE users
    ADD CONSTRAINT fk_users_couple_id 
    FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE SET NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE users DROP CONSTRAINT fk_users_couple_id;
  `);
}
