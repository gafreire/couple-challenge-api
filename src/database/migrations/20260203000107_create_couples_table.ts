import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE couple_status AS ENUM ('pending', 'active', 'inactive', 'cancelled');

    CREATE TABLE couples (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id_1 UUID NOT NULL,
      user_id_2 UUID,
      invited_email VARCHAR(255),
      invited_at TIMESTAMPTZ,
      status couple_status NOT NULL DEFAULT 'pending',
      couple_photo TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_couples_user_id_1 ON couples(user_id_1);
    CREATE INDEX idx_couples_user_id_2 ON couples(user_id_2);
    CREATE INDEX idx_couples_status ON couples(status);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE couples;
    DROP TYPE couple_status;
  `);
}