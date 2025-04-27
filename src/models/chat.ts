export interface Chat {
  chatid: string; // UUID
  userid?: string; // UUID, foreign key to users
  title?: string | null;
  created_at?: string; // ISO timestamp string
  updated_at?: string; // ISO timestamp string
  description?: string | null;
}
