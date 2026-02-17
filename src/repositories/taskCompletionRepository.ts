import db from "../database/connection";
import { TaskCompletion } from "../models/TaskCompletion";

export const taskCompletionRepository = {
  async create(data: {
    task_id: string;
    user_id: string;
    photo_url?: string | null;
    points_earned: number;
  }): Promise<TaskCompletion> {
    const result = await db.raw(
      `
      INSERT INTO task_completions (task_id, user_id, photo_url, points_earned, completed_at)
      VALUES (?, ?, ?, ?, NOW())
      RETURNING *
    `,
      [data.task_id, data.user_id, data.photo_url || null, data.points_earned],
    );

    return result.rows[0];
  },
  async findById(id: string): Promise<TaskCompletion | null> {
    const result = await db.raw(
      `
      SELECT * FROM task_completions WHERE id = ?
    `,
      [id],
    );

    return result.rows[0] || null;
  },
  async findByTaskId(taskId: string): Promise<TaskCompletion[]> {
    const result = await db.raw(
      `
      SELECT * FROM task_completions
      WHERE task_id = ?
      ORDER BY completed_at DESC
    `,
      [taskId],
    );

    return result.rows;
  },
  async findByUserId(userId: string): Promise<TaskCompletion[]> {
    const result = await db.raw(
      `
      SELECT * FROM task_completions
      WHERE user_id = ?
      ORDER BY completed_at DESC
    `,
      [userId],
    );

    return result.rows;
  },
  async findByUserAndChallenge(
    userId: string,
    challengeId: string,
  ): Promise<TaskCompletion[]> {
    const result = await db.raw(
      `
      SELECT tc.*
      FROM task_completions tc
      INNER JOIN tasks t ON tc.task_id = t.id
      WHERE tc.user_id = ? AND t.challenge_id = ?
      ORDER BY tc.completed_at DESC
    `,
      [userId, challengeId],
    );

    return result.rows;
  },
  async countByTaskId(taskId: string): Promise<number> {
    const result = await db.raw(
      `
      SELECT COUNT(*)::int as count
      FROM task_completions
      WHERE task_id = ?
    `,
      [taskId],
    );

    return result.rows[0].count;
  },
  async calcUserPoints(userId: string, challengeId: string): Promise<number> {
    const result = await db.raw(
      `
      SELECT COALESCE(SUM(tc.points_earned), 0)::int as total_points
      FROM task_completions tc
      INNER JOIN tasks t ON tc.task_id = t.id
      WHERE tc.user_id = ? AND t.challenge_id = ?
    `,
      [userId, challengeId],
    );

    return result.rows[0].total_points;
  },
  async calcChallengeScore(challengeId: string): Promise<{
    user_id_1: string;
    user_id_1_score: number;
    user_id_1_tasks: number;
    user_id_2: string | null;
    user_id_2_score: number;
    user_id_2_tasks: number;
  } | null> {
    const result = await db.raw(
      `
    SELECT 
      c.user_id_1,
      COALESCE(SUM(CASE WHEN tc.user_id = c.user_id_1 THEN tc.points_earned ELSE 0 END), 0)::int as user_id_1_score,
      COUNT(DISTINCT CASE WHEN tc.user_id = c.user_id_1 THEN tc.id END)::int as user_id_1_tasks,
      c.user_id_2,
      COALESCE(SUM(CASE WHEN tc.user_id = c.user_id_2 THEN tc.points_earned ELSE 0 END), 0)::int as user_id_2_score,
      COUNT(DISTINCT CASE WHEN tc.user_id = c.user_id_2 THEN tc.id END)::int as user_id_2_tasks
    FROM challenges ch
    INNER JOIN couples c ON ch.couple_id = c.id
    LEFT JOIN tasks t ON t.challenge_id = ch.id
    LEFT JOIN task_completions tc ON tc.task_id = t.id
    WHERE ch.id = ?
    GROUP BY c.user_id_1, c.user_id_2
  `,
      [challengeId],
    );

    return result.rows[0] || null;
  },
  async getCompletionWithTask(completionId: string): Promise<{
    completion: TaskCompletion;
    task: {
      id: string;
      name: string;
      points: number;
      challenge_id: string;
    };
  } | null> {
    const result = await db.raw(
      `
      SELECT 
        tc.*,
        json_build_object(
          'id', t.id,
          'name', t.name,
          'points', t.points,
          'challenge_id', t.challenge_id
        ) as task
      FROM task_completions tc
      INNER JOIN tasks t ON tc.task_id = t.id
      WHERE tc.id = ?
    `,
      [completionId],
    );

    if (!result.rows[0]) {
      return null;
    }

    const row = result.rows[0];

    return {
      completion: {
        id: row.id,
        task_id: row.task_id,
        user_id: row.user_id,
        completed_at: row.completed_at,
        photo_url: row.photo_url,
        points_earned: row.points_earned,
        created_at: row.created_at,
      },
      task: row.task,
    };
  },
  async delete(id: string): Promise<boolean> {
    const result = await db.raw(
      `
      DELETE FROM task_completions WHERE id = ?
      RETURNING id
    `,
      [id],
    );

    return result.rows.length > 0;
  },
};
