import { coupleRepository } from "../repositories/coupleRepository";
import { userAuthProviderRepository } from "../repositories/userAuthProviderRepository";
import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../errors/AppError";

export const coupleService = {
  // Criar casal (enviar convite)
  createCouple: async (userId: string, invitedEmail: string) => {
    const userAuthProviders =
      await userAuthProviderRepository.findByUserId(userId);
    const userEmails = userAuthProviders.map((provider) => provider.email);

    if (userEmails.includes(invitedEmail)) {
      throw new BadRequestError("You cannot invite yourself");
    }

    const hasCouple = await coupleRepository.userHasCouple(userId);
    if (hasCouple) {
      throw new ConflictError(
        "You already have a couple or pending invitation",
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(invitedEmail)) {
      throw new BadRequestError("Invalid email format");
    }
    const couple = await coupleRepository.create(userId, invitedEmail);
    return couple;
  },

  // Cancelar convite enviado
  cancelInvite: async (userId: string, coupleId: string) => {
    const couple = await coupleRepository.findById(coupleId);

    if (!couple) {
      throw new NotFoundError("Couple not found");
    }

    if (couple.user_id_1 !== userId) {
      throw new BadRequestError(
        "You don't have permission to cancel this invitation",
      );
    }

    if (couple.status !== "pending") {
      throw new BadRequestError("Only pending invitations can be cancelled");
    }

    await coupleRepository.updateStatus(coupleId, "cancelled");
  },
  listPendingInvites: async (userId: string) => {
  const userAuthProviders = await userAuthProviderRepository.findByUserId(userId);
  
  if (userAuthProviders.length === 0) {
    throw new AppError("User has no email registered", 500);
  }

  const emails = userAuthProviders.map((p) => p.email);
  
  const pendingInvites = await coupleRepository.findPendingInvitesByEmail(emails);
  
  return pendingInvites;
},
  listAllCouples: async () => {
    return await coupleRepository.findAll();
  },
};
