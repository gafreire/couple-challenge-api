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
  updateTask: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("User not authenticated");
      const { taskId } = req.params;
      const { name, description, points, max_completions } = req.body;
      const updatedTask = await taskService.updateTask(
        req.user.userId,
        taskId as string,
        {
          name,
          description,
          points,
          max_completions,
        },
      );
      res.status(200).json(updatedTask);
    } catch (error) {
      next(error);
    }
  },
  deleteTask: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("User not authenticated");
      const { taskId } = req.params;
      await taskService.deleteTask(req.user.userId, taskId as string);
      res.status(204).send()
    } catch (error) {
      next(error);
    }
  },
};
