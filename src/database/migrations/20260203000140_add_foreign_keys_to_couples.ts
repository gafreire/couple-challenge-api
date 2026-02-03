import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE couples
    ADD CONSTRAINT fk_couples_user_id_1 
    FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE;

    ALTER TABLE couples
    ADD CONSTRAINT fk_couples_user_id_2 
    FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE couples DROP CONSTRAINT fk_couples_user_id_1;
    ALTER TABLE couples DROP CONSTRAINT fk_couples_user_id_2;
  `);
}