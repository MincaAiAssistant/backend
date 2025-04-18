import { Request, Response } from 'express';
import { sql } from '../../db/postgres';

export const getMessagesByChatId = async (req: Request, res: Response) => {
  const chatid = req.params.chatid;

  try {
    const messages = await sql`
      SELECT * FROM messages
      WHERE chatid = ${chatid}
      ORDER BY created_at ASC;
    `;

    res.status(200).json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
