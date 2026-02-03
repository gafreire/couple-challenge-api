export interface Task {
    id: string;
    challenge_id: string;
    user_id: string;
    name: string;
    description: string | null;
    points: number;
    max_completions: number | null;
    created_at: Date;
    updated_at: Date;
}