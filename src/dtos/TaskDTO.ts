import { Task } from '../models/Task';

export interface TaskWithCountDTO {
  task: Task;
  completion_count: number;
}

export interface TaskWithProgressDTO {
  task: Task;
  completion_count: number;
}