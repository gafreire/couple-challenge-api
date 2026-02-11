import { Response, NextFunction } from "express";
import { userService } from "../services/user.service";
import { UnauthorizedError } from "../errors/AppError";
import { AuthRequest } from "../types/express-extensions";

export const userController = {
  getProfile: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const user = await userService.getProfile(req.user.userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const { name, profile_picture } = req.body;
      const updatedUser = await userService.updateProfile(req.user.userId, { 
        name, 
        profile_picture 
      });
      
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  },
};