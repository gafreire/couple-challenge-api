import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE task_completions
    ADD CONSTRAINT fk_task_completions_task_id 
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

    ALTER TABLE task_completions
    ADD CONSTRAINT fk_task_completions_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE task_completions DROP CONSTRAINT fk_task_completions_task_id;
    ALTER TABLE task_completions DROP CONSTRAINT fk_task_completions_user_id;
  `);
}
