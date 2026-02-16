import db from "../database/connection";
import { Couple } from "../models/Couple";

export const coupleRepository = {
  async create(user_id_1: string, invited_email: string): Promise<Couple> {
    const result = await db.raw(
      `
      INSERT INTO couples (user_id_1, invited_email, invited_at, status)
      VALUES (?, ?, NOW(), 'pending')
      RETURNING *
    `,
      [user_id_1, invited_email],
    );

    return result.rows[0];
  },
  async findById(id: string): Promise<Couple | null> {
    const result = await db.raw(
      `
      SELECT * FROM couples WHERE id = ?
    `,
      [id],
    );

    return result.rows[0] || null;
  },
  async findByUserId(userId: string): Promise<Couple | null> {
    const result = await db.raw(
      `
    SELECT * FROM couples
    WHERE user_id_1 = ? OR user_id_2 = ?
    ORDER BY 
      CASE status
        WHEN 'active' THEN 1
        WHEN 'pending' THEN 2
        ELSE 3
      END,
      created_at DESC
    LIMIT 1
  `,
      [userId, userId],
    );

    return result.rows[0] || null;
  },
  async findByInvitedEmail(email: string): Promise<Couple[]> {
    const result = await db.raw(
      `
      SELECT * FROM couples
      WHERE invited_email = ? AND status = 'pending'
      ORDER BY invited_at DESC
    `,
      [email],
    );

    return result.rows;
  },
  async acceptInvite(coupleId: string, userId: string): Promise<Couple | null> {
    const result = await db.raw(
      `
      UPDATE couples
      SET user_id_2 = ?,
          status = 'active',
          updated_at = NOW()
      WHERE id = ? AND status = 'pending'
      RETURNING *
    `,
      [userId, coupleId],
    );

    return result.rows[0] || null;
  },
  async update(
    id: string,
    data: {
      couple_photo?: string | null;
      invited_email?: string;
    },
  ): Promise<Couple | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.couple_photo !== undefined) {
      fields.push("couple_photo = ?");
      values.push(data.couple_photo);
    }

    if (data.invited_email !== undefined) {
      fields.push("invited_email = ?");
      values.push(data.invited_email);
    }

    fields.push("updated_at = NOW()");

    // Se não há campos para atualizar, retorna o registro atual
    if (fields.length === 1) {
      return this.findById(id);
    }

    values.push(id);

    const result = await db.raw(
      `
      UPDATE couples
      SET ${fields.join(", ")}
      WHERE id = ?
      RETURNING *
    `,
      values,
    );

    return result.rows[0] || null;
  },
  async updateStatus(
    id: string,
    status: "pending" | "active" | "inactive" | "cancelled",
  ): Promise<Couple | null> {
    const result = await db.raw(
      `
      UPDATE couples
      SET status = ?,
          updated_at = NOW()
      WHERE id = ?
      RETURNING *
    `,
      [status, id],
    );

    return result.rows[0] || null;
  },
  async cancel(id: string): Promise<Couple | null> {
    return this.updateStatus(id, "cancelled");
  },
  async userHasCouple(userId: string): Promise<boolean> {
    const result = await db.raw(
      `
      SELECT 1 FROM couples
      WHERE (user_id_1 = ? OR user_id_2 = ?)
      AND status IN ('pending', 'active')
      LIMIT 1
    `,
      [userId, userId],
    );

    return result.rows.length > 0;
  },

  async getCoupleWithUsers(coupleId: string): Promise<{
    couple: Couple;
    user_1: { id: string; name: string; profile_picture: string | null } | null;
    user_2: { id: string; name: string; profile_picture: string | null } | null;
  } | null> {
    const result = await db.raw(
      `
      SELECT 
        c.*,
        json_build_object(
          'id', u1.id,
          'name', u1.name,
          'profile_picture', u1.profile_picture
        ) as user_1,
        json_build_object(
          'id', u2.id,
          'name', u2.name,
          'profile_picture', u2.profile_picture
        ) as user_2
      FROM couples c
      INNER JOIN users u1 ON c.user_id_1 = u1.id
      LEFT JOIN users u2 ON c.user_id_2 = u2.id
      WHERE c.id = ?
    `,
      [coupleId],
    );

    if (!result.rows[0]) {
      return null;
    }

    const row = result.rows[0];

    return {
      couple: {
        id: row.id,
        user_id_1: row.user_id_1,
        user_id_2: row.user_id_2,
        invited_email: row.invited_email,
        invited_at: row.invited_at,
        status: row.status,
        couple_photo: row.couple_photo,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      user_1: row.user_1,
      user_2: row.user_2,
    };
  },
  async delete(id: string): Promise<boolean> {
    const result = await db.raw(
      `
      DELETE FROM couples WHERE id = ?
      RETURNING id
    `,
      [id],
    );

    return result.rows.length > 0;
  },
  async findPendingInvitesByEmail(emails: string[]): Promise<
    Array<{
      couple: Couple;
      user_1: { id: string; name: string; profile_picture: string | null };
    }>
  > {
    const placeholders = emails.map(() => "?").join(", ");

    const result = await db.raw(
      `
    SELECT 
      c.*,
      json_build_object(
        'id', u1.id,
        'name', u1.name,
        'profile_picture', u1.profile_picture
      ) as user_1
    FROM couples c
    INNER JOIN users u1 ON c.user_id_1 = u1.id
    WHERE c.invited_email IN (${placeholders}) AND c.status = 'pending'
    ORDER BY c.invited_at DESC
  `,
      emails,
    );

    return result.rows.map((row: any) => ({
      couple: {
        id: row.id,
        user_id_1: row.user_id_1,
        user_id_2: row.user_id_2,
        invited_email: row.invited_email,
        invited_at: row.invited_at,
        status: row.status,
        couple_photo: row.couple_photo,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      user_1: row.user_1,
    }));
  },
  async findAll(): Promise<Couple[]> {
    const result = await db.raw(`
    SELECT * FROM couples
    ORDER BY created_at DESC
  `);

    return result.rows;
  },
  async cancelAllPendingInvitesExcept(
    userId: string,
    emails: string[],
    exceptCoupleId: string,
  ): Promise<void> {
    const emailPlaceholders = emails.map(() => "?").join(", ");

    await db.raw(
      `
      UPDATE couples
      SET status = 'cancelled', updated_at = NOW()
      WHERE (
        user_id_1 = ? 
        OR user_id_2 = ? 
        OR invited_email IN (${emailPlaceholders})
      )
      AND status = 'pending'
      AND id != ?
    `,
      [userId, userId, ...emails, exceptCoupleId],
    );
  },
};
