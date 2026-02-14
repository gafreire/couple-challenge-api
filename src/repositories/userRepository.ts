import db from "../database/connection";
import { User } from "../models/User";

export const userRepository = {
  async create(data: Partial<User>): Promise<User> {
    const result = await db.raw(
      `
      INSERT INTO users (name, profile_picture, couple_id)
      VALUES (?, ?, ?)
      RETURNING *
    `,
      [data.name, data.profile_picture || null, data.couple_id || null],
    );

    return result.rows[0];
  },
  async findById(id: string): Promise<User | null> {
    const result = await db.raw(
      `
      SELECT * FROM users WHERE id = ?
    `,
      [id],
    );

    return result.rows[0] || null;
  },
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.raw(
      `
      SELECT u.* 
      FROM users u
      INNER JOIN user_auth_providers uap ON u.id = uap.user_id
      WHERE uap.email = ?
      LIMIT 1
    `,
      [email],
    );

    return result.rows[0] || null;
  },
  async update(
    id: string,
    data: { name?: string; profile_picture?: string },
  ): Promise<User | null> {
    // Build dynamic SET clause based on provided fields
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }

    if (data.profile_picture !== undefined) {
      fields.push("profile_picture = ?");
      values.push(data.profile_picture);
    }

    // Always update updated_at
    fields.push("updated_at = NOW()");

    // If no fields to update, return current user
    if (fields.length === 1) {
      // Only updated_at
      return this.findById(id);
    }

    // Add id to values array (for WHERE clause)
    values.push(id);

    const result = await db.raw(
      `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = ?
      RETURNING *
    `,
      values,
    );

    return result.rows[0] || null;
  },
  async delete(id: string): Promise<boolean> {
    const result = await db.raw(
      `
      DELETE FROM users WHERE id = ?
      RETURNING id
    `,
      [id],
    );

    return result.rows.length > 0;
  },
  async findAll(): Promise<User[]> {
    const result = await db.raw(`
    SELECT * FROM users
    ORDER BY created_at DESC
  `);

    return result.rows;
  },
  async updateCoupleId(
    userId: string,
    coupleId: string | null,
  ): Promise<User | null> {
    const result = await db.raw(
      `
      UPDATE users
      SET couple_id = ?, updated_at = NOW()
      WHERE id = ?
      RETURNING *
    `,
      [coupleId, userId],
    );
    return result.rows[0] || null;
  },
};
