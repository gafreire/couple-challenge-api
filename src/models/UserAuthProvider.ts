export interface UserAuthProvider {
  id: string;
  user_id: string;
  provider: 'local' | 'google' | 'facebook';
  email: string;
  password: string | null;
  provider_id: string | null;
  created_at: Date;
}