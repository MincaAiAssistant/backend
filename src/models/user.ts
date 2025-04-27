export interface User {
  userid: string;
  email: string;
  username: string;
  password: string;
  created_at?: string; // ISO date string
  auth_provider?: string | null;
}
