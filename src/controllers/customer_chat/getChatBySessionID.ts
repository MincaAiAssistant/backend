import { sql } from '../../db/postgres';

export const getCustomerChatBySessionID = async (req: any, res: any) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  try {
    const messages = await sql`
        SELECT
          messageid,
          role,
          content,
          created_at,
          sessionid AS "sessionId",
          attachments AS files
        FROM customer_messages
        WHERE sessionid = ${sessionId}
        ORDER BY created_at ASC
      `;

    return res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching customer chat messages:', err);
    return res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
};
