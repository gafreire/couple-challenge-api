import { BadRequestError, NotFoundError } from "../errors/AppError";
import { challengeRepository } from "../repositories/challengeRepository";
import { coupleRepository } from "../repositories/coupleRepository";
import { taskRepository } from "../repositories/taskRepository";

const canInteractWithTask = (
  userId: string,
  assignee: 'user_1' | 'user_2' | 'both',
  user_id_1: string,
  user_id_2: string | null,
): boolean => {
  if (assignee === 'both') return userId === user_id_1 || userId === user_id_2;
  if (assignee === 'user_1') return userId === user_id_1;
  if (assignee === 'user_2') return userId === user_id_2;
  return false;
};

export const taskService = {
  async createTask(
    userId: string,
    data: {
      challenge_id: string;
      name: string;
      description?: string;
      points: number;
      max_completions?: number;
      assignee?: 'user_1' | 'user_2' | 'both';
    },
  ) {
    const { challenge_id, name, description, points, max_completions, assignee } = data;

    const [challenge, couple] = await Promise.all([
      challengeRepository.findById(challenge_id),
      coupleRepository.findByUserId(userId),
    ]);

    if (!challenge) throw new NotFoundError("Challenge not found");
    if (!couple) throw new NotFoundError("You don't have a couple");
    if (challenge.couple_id !== couple.id)
      throw new BadRequestError("This challenge doesn't belong to your couple");
    if (challenge.status !== "active")
      throw new BadRequestError("Only active challenges can have tasks");
    if (points <= 0)
      throw new BadRequestError("Points must be greater than zero");
    if (max_completions !== undefined && max_completions <= 0)
      throw new BadRequestError("Max completions must be greater than zero");

    const validAssignees = ['user_1', 'user_2', 'both'];
    if (assignee && !validAssignees.includes(assignee))
      throw new BadRequestError("Invalid assignee. Must be: user_1, user_2 or both");

    const task = await taskRepository.create({
      challenge_id,
      user_id: userId,
      name,
      description,
      points,
      max_completions,
      assignee: assignee || 'both',
    });

    return task;
  },
  async listTasks(userId: string, challengeId: string) {
    const [challenge, couple] = await Promise.all([
      challengeRepository.findById(challengeId),
      coupleRepository.findByUserId(userId),
    ]);

    if (!challenge) throw new NotFoundError("Challenge not found");
    if (!couple) throw new NotFoundError("You don't have a couple");
    if (challenge.couple_id !== couple.id)
      throw new BadRequestError("This challenge doesn't belong to your couple");

    const tasksWithProgress = await taskRepository.getTasksWithProgress(challengeId);
    return tasksWithProgress;
  },
  async updateTask(
    userId: string,
    taskId: string,
    data: {
      name?: string;
      description?: string;
      points?: number;
      max_completions?: number;
      assignee?: 'user_1' | 'user_2' | 'both';
    }
  ) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");

    const [challenge, couple] = await Promise.all([
      challengeRepository.findById(task.challenge_id),
      coupleRepository.findByUserId(userId),
    ]);

    if (!challenge) throw new NotFoundError("Challenge not found");
    if (!couple) throw new NotFoundError("You don't have a couple");
    if (challenge.couple_id !== couple.id)
      throw new BadRequestError("This task doesn't belong to your couple");
    if (challenge.status !== "active")
      throw new BadRequestError("Only tasks from active challenges can be updated");
    if (data.points !== undefined && data.points <= 0)
      throw new BadRequestError("Points must be greater than zero");
    if (data.max_completions !== undefined && data.max_completions <= 0)
      throw new BadRequestError("Max completions must be greater than zero");

    const validAssignees = ['user_1', 'user_2', 'both'];
    if (data.assignee && !validAssignees.includes(data.assignee))
      throw new BadRequestError("Invalid assignee. Must be: user_1, user_2 or both");

    if (!canInteractWithTask(userId, task.assignee, couple.user_id_1, couple.user_id_2))
      throw new BadRequestError("You don't have permission to update this task");

    const updatedTask = await taskRepository.update(taskId, data);
    return updatedTask;
  },
  async deleteTask(userId: string, taskId: string) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");

    const [challenge, couple] = await Promise.all([
      challengeRepository.findById(task.challenge_id),
      coupleRepository.findByUserId(userId),
    ]);

    if (!challenge) throw new NotFoundError("Challenge not found");
    if (!couple) throw new NotFoundError("You don't have a couple");
    if (challenge.couple_id !== couple.id)
      throw new BadRequestError("This task doesn't belong to your couple");
    if (challenge.status !== "active")
      throw new BadRequestError("Only tasks from active challenges can be deleted");

    if (!canInteractWithTask(userId, task.assignee, couple.user_id_1, couple.user_id_2))
      throw new BadRequestError("You don't have permission to delete this task");

    await taskRepository.delete(taskId);
  }
};