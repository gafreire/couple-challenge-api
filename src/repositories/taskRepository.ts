import db from '../database/connection';
import { TaskWithCountDTO, TaskWithProgressDTO } from '../dtos/TaskDTO';
import { Task } from '../models/Task';

export const taskRepository = {
  async create(data: {
    challenge_id: string;
    user_id: string;
    name: string;
    description?: string | null;
    points: number;
    max_completions?: number | null;
  }): Promise<Task> {
    const result = await db.raw(`
      INSERT INTO tasks (challenge_id, user_id, name, description, points, max_completions)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `, [
      data.challenge_id,
      data.user_id,
      data.name,
      data.description || null,
      data.points,
      data.max_completions || null
    ]);

    return result.rows[0];
  },
  async findById(id: string): Promise<Task | null> {
    const result = await db.raw(`
      SELECT * FROM tasks WHERE id = ?
    `, [id]);

    return result.rows[0] || null;
  },
  async findByChallengeId(challengeId: string): Promise<Task[]> {
    const result = await db.raw(`
      SELECT * FROM tasks
      WHERE challenge_id = ?
      ORDER BY created_at ASC
    `, [challengeId]);

    return result.rows;
  },
  async findByUserAndChallenge(userId: string, challengeId: string): Promise<Task[]> {
    const result = await db.raw(`
      SELECT * FROM tasks
      WHERE user_id = ? AND challenge_id = ?
      ORDER BY created_at ASC
    `, [userId, challengeId]);

    return result.rows;
  },
  async countByUserAndChallenge(userId: string, challengeId: string): Promise<number> {
    const result = await db.raw(`
      SELECT COUNT(*)::int as count
      FROM tasks
      WHERE user_id = ? AND challenge_id = ?
    `, [userId, challengeId]);

    return result.rows[0].count;
  },
  async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      points?: number;
      max_completions?: number | null;
    }
  ): Promise<Task | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }

    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }

    if (data.points !== undefined) {
      fields.push('points = ?');
      values.push(data.points);
    }

    if (data.max_completions !== undefined) {
      fields.push('max_completions = ?');
      values.push(data.max_completions);
    }

    fields.push('updated_at = NOW()');

    // Se não há campos para atualizar, retorna o registro atual
    if (fields.length === 1) {
      return this.findById(id);
    }

    values.push(id);

    const result = await db.raw(`
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE id = ?
      RETURNING *
    `, values);

    return result.rows[0] || null;
  },
  async getTaskWithCompletionCount(taskId: string): Promise<TaskWithCountDTO | null> {
    const result = await db.raw(`
      SELECT 
        t.*,
        COUNT(tc.id)::int as completion_count
      FROM tasks t
      LEFT JOIN task_completions tc ON t.id = tc.task_id
      WHERE t.id = ?
      GROUP BY t.id
    `, [taskId]);

    if (!result.rows[0]) {
      return null;
    }

    const row = result.rows[0];

    return {
      task: {
        id: row.id,
        challenge_id: row.challenge_id,
        user_id: row.user_id,
        name: row.name,
        description: row.description,
        points: row.points,
        max_completions: row.max_completions,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      completion_count: row.completion_count,
    };
  },
  async getTasksWithProgress(challengeId: string): Promise<TaskWithProgressDTO[]> {
    const result = await db.raw(`
      SELECT 
        t.*,
        COUNT(tc.id)::int as completion_count
      FROM tasks t
      LEFT JOIN task_completions tc ON t.id = tc.task_id
      WHERE t.challenge_id = ?
      GROUP BY t.id
      ORDER BY t.created_at ASC
    `, [challengeId]);

    return result.rows.map((row: any) => ({
      task: {
        id: row.id,
        challenge_id: row.challenge_id,
        user_id: row.user_id,
        name: row.name,
        description: row.description,
        points: row.points,
        max_completions: row.max_completions,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      completion_count: row.completion_count,
    }));
  },
  async delete(id: string): Promise<boolean> {
    const result = await db.raw(`
      DELETE FROM tasks WHERE id = ?
      RETURNING id
    `, [id]);

    return result.rows.length > 0;
  }
};