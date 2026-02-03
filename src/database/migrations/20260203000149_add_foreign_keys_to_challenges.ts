import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE challenges
    ADD CONSTRAINT fk_challenges_couple_id 
    FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE;

    ALTER TABLE challenges
    ADD CONSTRAINT fk_challenges_winner_id 
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE challenges DROP CONSTRAINT fk_challenges_couple_id;
    ALTER TABLE challenges DROP CONSTRAINT fk_challenges_winner_id;
  `);
}