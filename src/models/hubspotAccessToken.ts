export interface HubspotAccessToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  userid?: string; // UUID, foreign key to users
}
