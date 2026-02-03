export interface Challenge {
    id: string;
    couple_id: string;
    name: string;
    start_date: Date;
    end_date: Date;
    period_type: 'mensal' | 'trimestral' | 'semestral' | 'anual';
    status: 'active' | 'completed' | 'cancelled';
    winner_id: string | null;
    winner_score: number | null;
    loser_score: number | null;
    created_at: Date;
    updated_at: Date;
}