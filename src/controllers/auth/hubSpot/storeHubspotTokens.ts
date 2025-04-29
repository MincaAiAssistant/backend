import { sql } from '../../../db/postgres';

export const storeHubspotTokens = async (req: any, res: any) => {
  try {
    const { refresh_token, access_token, expires_in } = req.body;
    const userId = req.user.id;

    if (!refresh_token || !access_token || !expires_in) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const access_token_expires_at = new Date(Date.now() + expires_in * 1000);

    await sql`
          INSERT INTO hubspot_tokens (user_id, access_token, refresh_token, access_token_expires_at)
          VALUES (${userId}, ${access_token}, ${refresh_token}, ${access_token_expires_at})
          ON CONFLICT (user_id) DO UPDATE SET
            access_token = EXCLUDED.access_token,
            refresh_token = EXCLUDED.refresh_token,
            access_token_expires_at = EXCLUDED.access_token_expires_at,
            updated_at = NOW();
        `;

    res.status(200).json({ message: 'Token stored or updated successfully' });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
