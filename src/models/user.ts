export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at?: string; // ISO date string
  auth_provider?: string | null;
}
