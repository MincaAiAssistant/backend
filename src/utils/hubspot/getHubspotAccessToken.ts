import { sql } from '../../db/postgres';
import { HubspotAccessToken } from '../../models/hubspotAccessToken';
import axios from 'axios';

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
const HUBSPOT_TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token';

export async function getValidAccessToken(userId: string): Promise<string> {
  const tokens = (await sql`
    SELECT * FROM hubspot_tokens
    WHERE user_id = ${userId}
    LIMIT 1
  `) as HubspotAccessToken[];
  const tokenRecord = tokens[0];
  if (!tokenRecord) {
    return '';
  }

  const now = new Date();
  const expiresAt = new Date(tokenRecord.expires_in);

  if (now < expiresAt) {
    return tokenRecord.access_token;
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: HUBSPOT_CLIENT_ID ?? '',
      client_secret: HUBSPOT_CLIENT_SECRET ?? '',
      refresh_token: tokenRecord.refresh_token,
    });
    const response = await axios.post(HUBSPOT_TOKEN_URL, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token, expires_in } = response.data;
    const newExpiresAt = new Date(Date.now() + expires_in * 1000);

    // Update tokens in DB
    await sql`
        UPDATE hubspot_tokens
        SET access_token = ${access_token},
            expires_at = ${newExpiresAt},
            updated_at = ${new Date()}
        WHERE user_id = ${userId}
      `;

    return access_token;
  } catch (error) {
    console.error('❌ Failed to refresh HubSpot access token', error);
    throw new Error('Failed to refresh HubSpot token');
  }
}
