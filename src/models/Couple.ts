export interface Couple {
  id: string;
  user_id_1: string;
  user_id_2: string | null;  // ← Aqui!
  invited_email: string | null;
  invited_at: Date | null;
  status: 'pending' | 'active' | 'inactive' | 'cancelled';
  couple_photo: string | null;
  created_at: Date;
  updated_at: Date;
}