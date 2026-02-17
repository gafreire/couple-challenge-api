import { BadRequestError, NotFoundError } from "../errors/AppError";
import { challengeRepository } from "../repositories/challengeRepository";
import { coupleRepository } from "../repositories/coupleRepository";
import { taskRepository } from "../repositories/taskRepository";

export const taskService = {
  async createTask(
  userId: string,
  data: {
    challenge_id: string;
    name: string;
    description?: string;
    points: number;
    max_completions?: number;
  },
) {
  const { challenge_id, name, description, points, max_completions } = data;
  
  const [challenge, couple] = await Promise.all([
    challengeRepository.findById(challenge_id),
    coupleRepository.findByUserId(userId)
  ]);
  
  if (!challenge) throw new NotFoundError("Challenge not found");
  if (!couple) throw new NotFoundError("You don't have a couple");
  if (challenge.couple_id !== couple.id) throw new BadRequestError("This challenge doesn't belong to your couple");
  if (challenge.status !== "active") throw new BadRequestError("Only active challenges can have tasks");
  if (points <= 0) throw new BadRequestError("Points must be greater than zero");
  if (max_completions !== undefined && max_completions <= 0) throw new BadRequestError("Max completions must be greater than zero");
  
  const task = await taskRepository.create({ 
    challenge_id, 
    user_id: userId, 
    name, 
    description, 
    points, 
    max_completions 
  });
  
  return task;
}
};
