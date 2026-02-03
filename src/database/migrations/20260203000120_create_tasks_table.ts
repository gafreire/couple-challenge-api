import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      challenge_id UUID NOT NULL,
      user_id UUID NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      points INTEGER NOT NULL CHECK (points > 0),
      max_completions INTEGER CHECK (max_completions > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_tasks_challenge_id ON tasks(challenge_id);
    CREATE INDEX idx_tasks_user_id ON tasks(user_id);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE tasks;
  `);
}