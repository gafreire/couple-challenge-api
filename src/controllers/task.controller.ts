import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/express-extensions";
import { UnauthorizedError } from "../errors/AppError";
import { taskService } from "../services/task.service";

export const taskController = {
  createTask: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("User not authenticated");

      const { challenge_id, name, description, points, max_completions } =
        req.body;
      const task = await taskService.createTask(req.user.userId, {
        challenge_id,
        name,
        description,
        points,
        max_completions,
      });
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  },
};
