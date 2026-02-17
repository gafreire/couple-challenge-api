import db from '../database/connection';
import { Challenge } from '../models/Challenge';

export const challengeRepository = {
  async create(data: {
    couple_id: string;
    name: string;
    start_date: Date;
    end_date: Date;
    period_type: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  }): Promise<Challenge> {
    const result = await db.raw(`
      INSERT INTO challenges (couple_id, name, start_date, end_date, period_type, status)
      VALUES (?, ?, ?, ?, ?, 'active')
      RETURNING *
    `, [
      data.couple_id,
      data.name,
      data.start_date,
      data.end_date,
      data.period_type
    ]);

    return result.rows[0];
  },
  async findById(id: string): Promise<Challenge | null> {
    const result = await db.raw(`
      SELECT * FROM challenges WHERE id = ?
    `, [id]);

    return result.rows[0] || null;
  },
  async findByCoupleId(coupleId: string): Promise<Challenge[]> {
    const result = await db.raw(`
      SELECT * FROM challenges
      WHERE couple_id = ?
      ORDER BY start_date DESC
    `, [coupleId]);

    return result.rows;
  },
  async findActiveByCouple(coupleId: string): Promise<Challenge | null> {
    const result = await db.raw(`
      SELECT * FROM challenges
      WHERE couple_id = ?
      AND status = 'active'
      AND NOW() BETWEEN start_date AND end_date
      LIMIT 1
    `, [coupleId]);

    return result.rows[0] || null;
  },
  async findCompletedByCouple(coupleId: string): Promise<Challenge[]> {
    const result = await db.raw(`
      SELECT * FROM challenges
      WHERE couple_id = ?
      AND status = 'completed'
      ORDER BY end_date DESC
    `, [coupleId]);

    return result.rows;
  },
  async update(
    id: string,
    data: {
      name?: string;
      start_date?: Date;
      end_date?: Date;
      period_type?: 'mensal' | 'trimestral' | 'semestral' | 'anual';
      status?: 'active' | 'completed' | 'cancelled';
    }
  ): Promise<Challenge | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }

    if (data.start_date !== undefined) {
      fields.push('start_date = ?');
      values.push(data.start_date);
    }

    if (data.end_date !== undefined) {
      fields.push('end_date = ?');
      values.push(data.end_date);
    }

    if (data.period_type !== undefined) {
      fields.push('period_type = ?');
      values.push(data.period_type);
    }

    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    fields.push('updated_at = NOW()');

    // Se não há campos para atualizar, retorna o registro atual
    if (fields.length === 1) {
      return this.findById(id);
    }

    values.push(id);

    const result = await db.raw(`
      UPDATE challenges
      SET ${fields.join(', ')}
      WHERE id = ?
      RETURNING *
    `, values);

    return result.rows[0] || null;
  },
  async completeChallenge(
    id: string,
    winnerId: string | null,
    winnerScore: number,
    loserScore: number
  ): Promise<Challenge | null> {
    const result = await db.raw(`
      UPDATE challenges
      SET status = 'completed',
          winner_id = ?,
          winner_score = ?,
          loser_score = ?,
          updated_at = NOW()
      WHERE id = ?
      RETURNING *
    `, [winnerId, winnerScore, loserScore, id]);

    return result.rows[0] || null;
  },
  async cancel(id: string): Promise<Challenge | null> {
    const result = await db.raw(`
      UPDATE challenges
      SET status = 'cancelled',
          updated_at = NOW()
      WHERE id = ?
      RETURNING *
    `, [id]);

    return result.rows[0] || null;
  },
  async coupleHasActiveChallenge(coupleId: string): Promise<boolean> {
    const result = await db.raw(`
      SELECT 1 FROM challenges
      WHERE couple_id = ?
      AND status = 'active'
      LIMIT 1
    `, [coupleId]);

    return result.rows.length > 0;
  },
  async getChallengeWithWinner(challengeId: string): Promise<{
    challenge: Challenge;
    winner: { id: string; name: string; profile_picture: string | null } | null;
  } | null> {
    const result = await db.raw(`
      SELECT 
        c.*,
        CASE 
          WHEN c.winner_id IS NOT NULL THEN 
            json_build_object(
              'id', u.id,
              'name', u.name,
              'profile_picture', u.profile_picture
            )
          ELSE NULL
        END as winner
      FROM challenges c
      LEFT JOIN users u ON c.winner_id = u.id
      WHERE c.id = ?
    `, [challengeId]);

    if (!result.rows[0]) {
      return null;
    }

    const row = result.rows[0];

    return {
      challenge: {
        id: row.id,
        couple_id: row.couple_id,
        name: row.name,
        start_date: row.start_date,
        end_date: row.end_date,
        period_type: row.period_type,
        status: row.status,
        winner_id: row.winner_id,
        winner_score: row.winner_score,
        loser_score: row.loser_score,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      winner: row.winner,
    };
  },
  async delete(id: string): Promise<boolean> {
    const result = await db.raw(`
      DELETE FROM challenges WHERE id = ?
      RETURNING id
    `, [id]);

    return result.rows.length > 0;
  }
};