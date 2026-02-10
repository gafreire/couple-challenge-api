import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository";
import { userAuthProviderRepository } from "../repositories/userAuthProviderRepository";
import { config } from "../config/env";
import { BadRequestError, UnauthorizedError } from "../errors/AppError";

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  coupleId: string | null;
}

const SALT_ROUNDS = 10;
const INVALID_CREDENTIALS = "Invalid email or password";

export const authService = {
  signup: async (data: { name: string; email: string; password: string }) => {
    // 1. Validar se email já existe
    if (await userAuthProviderRepository.emailExists(data.email, "local")) {
      throw new BadRequestError("Email already exists");

    }

    // 2. Hash da senha

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // 3. Criar user
    const user = await userRepository.create({
      name: data.name,
    });

    // 4. Criar auth provider
    const authProvider = await userAuthProviderRepository.create({
      user_id: user.id,
      provider: "local",
      email: data.email,
      password: hashedPassword,
    });

    // 5. Gerar JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: data.email,
        name: data.name,
        coupleId: user.couple_id,
      },
      config.jwt.secret,
      { expiresIn: "30d" },
    );

    // 6. Retornar o token + dados do user
    return {
      token,
      user: {
        id: user.id,
        email: data.email,
        name: data.name,
        couple_id: user.couple_id,
      },
    };
  },
  login: async (data: { email: string; password: string }) => {
    // 1. Encontrar auth provider pelo email
    const authProvider = await userAuthProviderRepository.findByEmail(
      data.email,
      "local",
    );

    if (!authProvider || !authProvider.password) throw new UnauthorizedError(INVALID_CREDENTIALS);


    const isMatch = await bcrypt.compare(data.password, authProvider.password);
    if (!isMatch) throw new UnauthorizedError(INVALID_CREDENTIALS)
    //3. Encontrar user
    const user = await userRepository.findById(authProvider.user_id);
    if(!user) throw new Error("User not found");
    // 4. Gerar JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: authProvider.email,
        name: user.name,
        coupleId: user.couple_id,
      },
      config.jwt.secret,
      { expiresIn: "30d" },
    );

    // 5. Retornar o token + dados do user
    return {
      token,
      user: {
        id: user.id,
        email: authProvider.email,
        name: user.name,
        couple_id: user.couple_id,
      },
    };
  },
  validateToken: async (token: string) => {
  try {    
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    
    return {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        coupleId: decoded.coupleId,
    }
    
  } catch (error) {
    throw new UnauthorizedError("Invalid token");
  }
}
};
