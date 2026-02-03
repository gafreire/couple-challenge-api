import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE user_auth_providers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      provider VARCHAR(50) NOT NULL CHECK (provider IN ('local', 'google', 'facebook')),
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255),
      provider_id VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(email, provider)
    );

    CREATE INDEX idx_user_auth_providers_user_id ON user_auth_providers(user_id);
    CREATE INDEX idx_user_auth_providers_email ON user_auth_providers(email);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE user_auth_providers;
  `);
}