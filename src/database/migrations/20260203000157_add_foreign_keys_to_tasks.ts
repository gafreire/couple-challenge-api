import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_challenge_id 
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE;

    ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE tasks DROP CONSTRAINT fk_tasks_challenge_id;
    ALTER TABLE tasks DROP CONSTRAINT fk_tasks_user_id;
  `);
}
