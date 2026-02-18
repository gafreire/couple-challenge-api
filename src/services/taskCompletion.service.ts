import { BadRequestError, NotFoundError } from "../errors/AppError";
import { challengeRepository } from "../repositories/challengeRepository";
import { coupleRepository } from "../repositories/coupleRepository";
import { taskCompletionRepository } from "../repositories/taskCompletionRepository";
import { taskRepository } from "../repositories/taskRepository";

export const taskCompletionService = {
  async completeTask(
    userId: string,
    data: { task_id: string; photo_url?: string },
  ) {
    const { task_id, photo_url } = data;

    const task = await taskRepository.findById(task_id);
    if (!task) throw new NotFoundError("Task not found");

    const [challenge, couple] = await Promise.all([
      challengeRepository.findById(task.challenge_id),
      coupleRepository.findByUserId(userId),
    ]);

    if (!couple) throw new NotFoundError("You don't have a couple");
    if (!challenge) throw new NotFoundError("Challenge not found");
    if (challenge.couple_id !== couple.id)
      throw new BadRequestError("This task doesn't belong to your couple");
    if (challenge.status !== "active")
      throw new BadRequestError(
        "Only tasks from active challenges can be completed",
      );

    if (task.user_id !== userId)
      throw new BadRequestError("You can only complete your own tasks");

    if (task.max_completions !== null) {
      const completedTasks =
        await taskCompletionRepository.countByTaskId(task_id);
      if (completedTasks >= task.max_completions) {
        throw new BadRequestError("Task has reached max completions");
      }
    }

    const completion = await taskCompletionRepository.create({
      task_id,
      user_id: userId,
      photo_url,
      points_earned: task.points,
    });

    return completion;
  },
};
