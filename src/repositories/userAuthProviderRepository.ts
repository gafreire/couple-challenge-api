import db from '../database/connection';
import { UserAuthProvider } from '../models/UserAuthProvider';

export const userAuthProviderRepository = {
  async create(data: {
    user_id: string;
    provider: 'local' | 'google' | 'facebook';
    email: string;
    password?: string | null;
    provider_id?: string | null;
  }): Promise<UserAuthProvider> {
    const result = await db.raw(`
      INSERT INTO user_auth_providers (user_id, provider, email, password, provider_id)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `, [
      data.user_id,
      data.provider,
      data.email,
      data.password || null,
      data.provider_id || null
    ]);

    return result.rows[0];
  },
  async findById(id: string): Promise<UserAuthProvider | null> {
    const result = await db.raw(`
      SELECT * FROM user_auth_providers WHERE id = ?
    `, [id]);

    return result.rows[0] || null;
  },
  async findByEmail(
    email: string,
    provider?: 'local' | 'google' | 'facebook'
  ): Promise<UserAuthProvider | null> {
    let query = `SELECT * FROM user_auth_providers WHERE email = ?`;
    const params: any[] = [email];

    if (provider) {
      query += ` AND provider = ?`;
      params.push(provider);
    }

    query += ` LIMIT 1`;

    const result = await db.raw(query, params);

    return result.rows[0] || null;
  },
  async findByUserId(userId: string): Promise<UserAuthProvider[]> {
    const result = await db.raw(`
      SELECT * FROM user_auth_providers
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);

    return result.rows;
  },
  async findByProviderId(
    providerId: string,
    provider: 'google' | 'facebook'
  ): Promise<UserAuthProvider | null> {
    const result = await db.raw(`
      SELECT * FROM user_auth_providers
      WHERE provider_id = ? AND provider = ?
      LIMIT 1
    `, [providerId, provider]);

    return result.rows[0] || null;
  },
  async update(
    id: string,
    data: {
      email?: string;
      password?: string | null;
      provider_id?: string | null;
    }
  ): Promise<UserAuthProvider | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }

    if (data.password !== undefined) {
      fields.push('password = ?');
      values.push(data.password);
    }

    if (data.provider_id !== undefined) {
      fields.push('provider_id = ?');
      values.push(data.provider_id);
    }

    // Se não há campos para atualizar, retorna o registro atual
    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await db.raw(`
      UPDATE user_auth_providers
      SET ${fields.join(', ')}
      WHERE id = ?
      RETURNING *
    `, values);

    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await db.raw(`
      DELETE FROM user_auth_providers WHERE id = ?
      RETURNING id
    `, [id]);

    return result.rows.length > 0;
  },

  async emailExists(
    email: string,
    provider: 'local' | 'google' | 'facebook'
  ): Promise<boolean> {
    const result = await db.raw(`
      SELECT 1 FROM user_auth_providers
      WHERE email = ? AND provider = ?
      LIMIT 1
    `, [email, provider]);

    return result.rows.length > 0;
  }
};