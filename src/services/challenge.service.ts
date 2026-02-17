import { BadRequestError, NotFoundError } from "../errors/AppError";
import { challengeRepository } from "../repositories/challengeRepository";
import { coupleRepository } from "../repositories/coupleRepository";

export const challengeService = {
    async createChallenge(userId: string, data: { name: string; start_date: Date; end_date: Date; period_type: 'mensal' | 'trimestral' | 'semestral' | 'anual' }) {
        const couple = await coupleRepository.findByUserId(userId)
        if(!couple) throw new NotFoundError("You don't have a couple");
        if(couple.status !== "active") throw new BadRequestError("You don't have an active couple");
        if(data.end_date <= data.start_date) throw new BadRequestError("End date must be after start date");
        const hasActiveChallenge = await challengeRepository.coupleHasActiveChallenge(couple.id)
        if(hasActiveChallenge) throw new BadRequestError("You already have an active challenge");
        const validPeriods = ['mensal', 'trimestral', 'semestral', 'anual'];
        if (!validPeriods.includes(data.period_type)) throw new BadRequestError("Invalid period type. Must be: mensal, trimestral, semestral, or anual");
            

        const challenge = await challengeRepository.create({ couple_id: couple.id, name: data.name, start_date: data.start_date, end_date: data.end_date, period_type: data.period_type })
        return challenge;
    },
    async listChallenges(userId: string) {
        const couple = await coupleRepository.findByUserId(userId)
        if(!couple) throw new NotFoundError("You don't have a couple");
        if(couple.status !== "active") throw new BadRequestError("You don't have an active couple");
        const challenges = await challengeRepository.findByCoupleId(couple.id);
        return challenges;
    }
}