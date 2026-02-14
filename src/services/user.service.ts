import { userRepository } from "../repositories/userRepository";
import { NotFoundError } from "../errors/AppError";

export const userService = {
  // Ver próprio perfil
  getProfile: async (userId: string) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  },

  // Atualizar perfil
  updateProfile: async (
    userId: string,
    data: { name?: string; profile_picture?: string },
  ) => {
    const updatedUser = await userRepository.update(userId, data);

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    return updatedUser;
  },
  getAllUsers: async () => {
    return await userRepository.findAll();
  },
};
