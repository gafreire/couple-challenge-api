import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE task_completions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id UUID NOT NULL,
      user_id UUID NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      photo_url TEXT,
      points_earned INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_task_completions_task_id ON task_completions(task_id);
    CREATE INDEX idx_task_completions_user_id ON task_completions(user_id);
    CREATE INDEX idx_task_completions_completed_at ON task_completions(completed_at);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE task_completions;
  `);
}