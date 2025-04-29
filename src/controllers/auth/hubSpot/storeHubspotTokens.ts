import { sql } from '../../../db/postgres';

export const storeHubspotTokens = async (req: any, res: any) => {
  try {
    const { refresh_token, access_token, expires_in } = req.body;
    const userId = (req as any).user.userid;

    if (!refresh_token || !access_token || !expires_in) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expires_at = new Date(Date.now() + expires_in * 1000);

    await sql`
          INSERT INTO hubspot_tokens (userid, access_token, refresh_token, expires_at)
  VALUES (${userId}, ${access_token}, ${refresh_token}, ${expires_at})
  ON CONFLICT (userid) DO UPDATE SET
    access_token = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token,
    expires_at = EXCLUDED.expires_at  RETURNING *;
        `;

    res.status(200).json({ message: 'Token stored or updated successfully' });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
