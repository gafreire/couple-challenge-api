export interface User {
  id: string;
  name: string;
  profile_picture: string | null;
  couple_id: string | null;
  created_at: Date;
  updated_at: Date;
}