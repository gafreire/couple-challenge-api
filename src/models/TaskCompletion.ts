export interface TaskCompletion {
  id: string;
  task_id: string;
  user_id: string;
  completed_at: Date;
  photo_url: string | null;
  points_earned: number;
  created_at: Date;
}