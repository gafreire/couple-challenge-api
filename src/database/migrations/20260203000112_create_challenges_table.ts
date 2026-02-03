import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE period_type AS ENUM ('mensal', 'trimestral', 'semestral', 'anual');
    CREATE TYPE challenge_status AS ENUM ('active', 'completed', 'cancelled');

    CREATE TABLE challenges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      couple_id UUID NOT NULL,
      name VARCHAR(255) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      period_type period_type NOT NULL,
      status challenge_status NOT NULL DEFAULT 'active',
      winner_id UUID,
      winner_score INTEGER,
      loser_score INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_challenges_couple_id ON challenges(couple_id);
    CREATE INDEX idx_challenges_status ON challenges(status);
    CREATE INDEX idx_challenges_dates ON challenges(start_date, end_date);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE challenges;
    DROP TYPE challenge_status;
    DROP TYPE period_type;
  `);
}
