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

    const nonce = Math.random().toString(36).substr(2, 10); // Generate a random nonce

    // Send the nonce in the response and add it to the CSP header
    res.setHeader(
      'Content-Security-Policy',
      `script-src 'self' 'nonce-${nonce}'`
    );

    // Return the HTML with the nonce applied to the script
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>HubSpot Auth</title>
        </head>
        <body>
          <p>You can now close this window.</p>
          <script nonce="${nonce}">
            window.close();
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    const nonce = Math.random().toString(36).substr(2, 10); // Generate a random nonce

    console.error(
      'Error exchanging HubSpot code:',
      error.response?.data || error.message
    );

    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>HubSpot Auth</title>
        </head>
        <body>
          <p>There was an error. You can now close this window.</p>
          <script nonce="${nonce}">
            window.close();
          </script>
        </body>
      </html>
    `);
  }
};
