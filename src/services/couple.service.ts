import { coupleRepository } from "../repositories/coupleRepository";
import { userAuthProviderRepository } from "../repositories/userAuthProviderRepository";
import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../errors/AppError";
import { userRepository } from "../repositories/userRepository";

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
    const userAuthProviders =
      await userAuthProviderRepository.findByUserId(userId);

    if (userAuthProviders.length === 0) {
      throw new AppError("User has no email registered", 500);
    }

    const emails = userAuthProviders.map((p) => p.email);

    const pendingInvites =
      await coupleRepository.findPendingInvitesByEmail(emails);

    return pendingInvites;
  },
  listAllCouples: async () => {
    return await coupleRepository.findAll();
  },
  acceptInvite: async (userId: string, coupleId: string) => {
    const couple = await coupleRepository.findById(coupleId);
    if (!couple) throw new NotFoundError("Couple not found");
    if (couple.status !== "pending")
      throw new BadRequestError("Only pending invites can be accepted");
    if (!couple.invited_email)
      throw new BadRequestError("Invalid invitation data");

    const userAuthProviders =
      await userAuthProviderRepository.findByUserId(userId);
    const userEmails = userAuthProviders.map((p) => p.email);

    if (!userEmails.includes(couple.invited_email))
      throw new BadRequestError("This invite is not for you");
    if (await coupleRepository.userHasCouple(userId))
      throw new ConflictError(
        "You already have a couple or pending invitation",
      );

    // Aceitar convite
    await coupleRepository.acceptInvite(coupleId, userId);

    // Atualizar couple_id de ambos EM PARALELO
    await Promise.all([
      userRepository.updateCoupleId(userId, coupleId),
      userRepository.updateCoupleId(couple.user_id_1, coupleId),
    ]);

    // Buscar emails do user_id_1 E cancelar convites de ambos EM PARALELO
    const user1AuthProviders = await userAuthProviderRepository.findByUserId(
      couple.user_id_1,
    );
    const user1Emails = user1AuthProviders.map((p) => p.email);

    await Promise.all([
      coupleRepository.cancelAllPendingInvitesExcept(
        userId,
        userEmails,
        coupleId,
      ),
      coupleRepository.cancelAllPendingInvitesExcept(
        couple.user_id_1,
        user1Emails,
        coupleId,
      ),
    ]);

    return await coupleRepository.getCoupleWithUsers(coupleId);
  },
  declineInvite: async (userId: string, coupleId: string) => {
    const couple = await coupleRepository.findById(coupleId);

    if (!couple) throw new NotFoundError("Couple not found");
    if (couple.status !== "pending")
      throw new BadRequestError("Only pending invites can be declined");
    if (!couple.invited_email)
      throw new BadRequestError("Invalid invitation data");

    const userAuthProviders =
      await userAuthProviderRepository.findByUserId(userId);
    const userEmails = userAuthProviders.map((p) => p.email);

    if (!userEmails.includes(couple.invited_email))
      throw new BadRequestError("This invite is not for you");

    await coupleRepository.updateStatus(coupleId, "cancelled");
  },
  getMyCouple: async (userId: string) => {
    const couple = await coupleRepository.findByUserId(userId);
    if (!couple) throw new NotFoundError("You don't have a couple");
    if (couple.status !== "active")
      throw new BadRequestError("You don't have a couple");
    const coupleWithUsers = await coupleRepository.getCoupleWithUsers(
      couple.id,
    );
    return coupleWithUsers;
  },
  leaveCouple: async (userId: string) => {
    const couple = await coupleRepository.findByUserId(userId);
    if (!couple) throw new NotFoundError("You don't have a couple");
    if (couple.status !== "active")
      throw new BadRequestError("You don't have an active couple");

    const updates = [
      userRepository.updateCoupleId(couple.user_id_1, null),
      coupleRepository.updateStatus(couple.id, "inactive"),
    ];

    if (couple.user_id_2) {
      updates.push(userRepository.updateCoupleId(couple.user_id_2, null));
    }

    await Promise.all(updates);
  },
  getMyPendingCouple: async (userId: string) => {
    const couple = await coupleRepository.findPendingByUserId(userId);
    if (!couple) throw new NotFoundError("No pending couple found");
    return couple;
  },
};
