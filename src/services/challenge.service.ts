import { BadRequestError, NotFoundError } from "../errors/AppError";
import { challengeRepository } from "../repositories/challengeRepository";
import { coupleRepository } from "../repositories/coupleRepository";
import { taskCompletionRepository } from "../repositories/taskCompletionRepository";

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
    },
    async getActiveChallenge(userId: string) {
        const couple = await coupleRepository.findByUserId(userId)
        if(!couple) throw new NotFoundError("You don't have a couple");
        if(couple.status !== "active") throw new BadRequestError("You don't have an active couple");
        const activeChallenge = await challengeRepository.findActiveByCouple(couple.id);
        if(!activeChallenge) throw new NotFoundError("You don't have an active challenge");
        return activeChallenge;
    },
    async finishChallenge(userId: string, challengeId: string) {
  const couple = await coupleRepository.findByUserId(userId);
  if (!couple) throw new NotFoundError("You don't have a couple");
  if (couple.status !== "active") throw new BadRequestError("You don't have an active couple");
  
  const challenge = await challengeRepository.findById(challengeId);
  if (!challenge) throw new NotFoundError("Challenge not found");
  if (challenge.couple_id !== couple.id) throw new BadRequestError("This challenge does not belong to your couple");
  if (challenge.status !== 'active') throw new BadRequestError("Only active challenges can be finished");
  
  const calculatedPoints = await taskCompletionRepository.calcChallengeScore(challengeId);
  if (!calculatedPoints) throw new NotFoundError("No task completions found for this challenge");
  
  let winner: string | null = null;
  
  // Comparar pontuação
  if (calculatedPoints.user_id_1_score > calculatedPoints.user_id_2_score) 
    winner = couple.user_id_1;
  else if (calculatedPoints.user_id_2_score > calculatedPoints.user_id_1_score) 
    winner = couple.user_id_2;
  else {
    // Empate em pontos - desempate por tarefas completadas
    if (calculatedPoints.user_id_1_tasks > calculatedPoints.user_id_2_tasks) {
      winner = couple.user_id_1;
    } else if (calculatedPoints.user_id_2_tasks > calculatedPoints.user_id_1_tasks) {
      winner = couple.user_id_2;
    }
    // Se empatar em tarefas também, winner fica null (empate total)
  }
  
  const winnerScore = winner === couple.user_id_1 
    ? calculatedPoints.user_id_1_score 
    : (winner === couple.user_id_2 ? calculatedPoints.user_id_2_score : Math.max(calculatedPoints.user_id_1_score, calculatedPoints.user_id_2_score));
  
  const loserScore = winner === couple.user_id_1 
    ? calculatedPoints.user_id_2_score 
    : (winner === couple.user_id_2 ? calculatedPoints.user_id_1_score : Math.min(calculatedPoints.user_id_1_score, calculatedPoints.user_id_2_score));
  
  await challengeRepository.completeChallenge(challengeId, winner, winnerScore, loserScore);
  
  return await challengeRepository.getChallengeWithWinner(challengeId);
}
}