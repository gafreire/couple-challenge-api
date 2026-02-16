import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express-extensions";
import { coupleService } from "../services/couple.service";
import { BadRequestError, UnauthorizedError } from "../errors/AppError";

export const coupleController = {
  createCouple: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("User not authenticated");

      const { invitedEmail } = req.body;

      const couple = await coupleService.createCouple(
        req.user.userId,
        invitedEmail,
      );

      res.status(201).json(couple);
    } catch (error) {
      next(error);
    }
  },

  cancelInvite: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("User not authenticated");

      const { coupleId } = req.params;

      await coupleService.cancelInvite(req.user.userId, coupleId as string);

      res.status(200).json({ message: "Invite cancelled successfully" });
    } catch (error) {
      next(error);
    }
  },
  listPendingInvites: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) throw new UnauthorizedError("User not authenticated");
      const invites = await coupleService.listPendingInvites(req.user.userId);
      res.status(200).json(invites);
    } catch (error) {
      next(error);
    }
  },
  listAllCouples: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) throw new UnauthorizedError("User not authenticated");

      const couples = await coupleService.listAllCouples();

      res.status(200).json(couples);
    } catch (error) {
      next(error);
    }
  },
  acceptInvite: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("User not authenticated");
      const { coupleId }= req.params
      const couple = await coupleService.acceptInvite(req.user.userId, coupleId as string);
      res.status(200).json(couple)
    } catch (error) {
      next(error);
    }
  },
  declineInvite: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("User not authenticated");
      const { coupleId }= req.params
      await coupleService.declineInvite(req.user.userId, coupleId as string);
      res.status(200).json({ message: "Invite declined successfully" });
    } catch (error) {
      next(error);
    }},
  getMyCouple: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("User not authenticated");
      const couple = await coupleService.getMyCouple(req.user.userId);
      res.status(200).json(couple);
    } catch (error) {
      next(error);
    }},
  leaveCouple: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("User not authenticated");
      await coupleService.leaveCouple(req.user.userId);
      res.status(200).json({ message: "You have left the couple successfully" });
    } catch (error) {
      next(error);
    }}
};
