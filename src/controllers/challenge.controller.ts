import { NextFunction, Response } from "express";
import { challengeService } from "../services/challenge.service";
import { AuthRequest } from "../types/express-extensions";
import { UnauthorizedError } from "../errors/AppError";
import { taskService } from "../services/task.service";

export const challengeController = {
  createChallenge: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) throw new UnauthorizedError("User not authenticated");

      const { name, start_date, end_date, period_type } = req.body;

      const challenge = await challengeService.createChallenge(
        req.user.userId,
        {
          name,
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          period_type,
        },
      );

      res.status(201).json(challenge);
    } catch (error) {
      next(error);
    }
  },
  listChallenges: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) throw new UnauthorizedError("User not authenticated");
      const challenges = await challengeService.listChallenges(req.user.userId);
      res.status(200).json(challenges);
    } catch (error) {
      next(error);
    }
  },
  getActiveChallenge: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) throw new UnauthorizedError("User not authenticated");
      const activeChallenge = await challengeService.getActiveChallenge(
        req.user.userId,
      );
      res.status(200).json(activeChallenge);
    } catch (error) {
      next(error);
    }
  },
  finishChallenge: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) throw new UnauthorizedError("User not authenticated");
      const { challengeId } = req.params;
      const result = await challengeService.finishChallenge(
        req.user.userId,
        challengeId as string,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  listTasks: async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new UnauthorizedError("User not authenticated");
    
    const { challengeId } = req.params;
    
    const tasks = await taskService.listTasks(req.user.userId, challengeId as string);
    
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
}
};
