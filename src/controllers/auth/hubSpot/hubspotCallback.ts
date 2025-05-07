// src/controllers/hubspotAuth.ts

import axios from 'axios';
import { sql } from '../../../db/postgres';

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID || '';
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET || '';
const HUBSPOT_TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token';
const REDIRECT_URI = process.env.REDIRECT_URI || '';

export const hubspotCallback = async (req: any, res: any) => {
  const code = req.query.code as string;
  const userId = req.query.state as string;

  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  if (!userId) {
    return res.status(401).send('Missing state (user ID)');
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: HUBSPOT_CLIENT_ID,
      client_secret: HUBSPOT_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
    });

    const response = await axios.post(HUBSPOT_TOKEN_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token, refresh_token, expires_in } = response.data;
    const access_token_expires_at = new Date(Date.now() + expires_in * 1000);

    await sql`
      INSERT INTO hubspot_tokens (
        userid, access_token, refresh_token, expires_at
      )
      VALUES (
        ${userId}, ${access_token}, ${refresh_token}, ${access_token_expires_at}
      )
      ON CONFLICT (userid) DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at
    `;

    return res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              status: "success",
              access_token: "${access_token}"
            }, "*");
            window.close();
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error(
      'Error exchanging HubSpot code:',
      error.response?.data || error.message
    );

    return res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              status: "error",
              message: "HubSpot connection failed"
            }, "*");
            window.close();
          </script>
        </body>
      </html>
    `);
  }
};
