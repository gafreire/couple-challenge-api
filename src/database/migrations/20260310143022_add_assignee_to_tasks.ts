import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE task_assignee AS ENUM ('user_1', 'user_2', 'both');

    ALTER TABLE tasks
    ADD COLUMN assignee task_assignee NOT NULL DEFAULT 'both';

    UPDATE tasks SET assignee = 'both';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE tasks DROP COLUMN assignee;
    DROP TYPE task_assignee;
  `);
}




