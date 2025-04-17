import { sql } from '../../db/postgres';
import { Request, Response } from 'express';

export const getAllChats = async (req: Request, res: Response) => {
  const userid = (req as any).user.userid;

  try {
    const chats = await sql`
        SELECT * FROM chats
        WHERE userid = ${userid}
        ORDER BY updated_at DESC
      `;
    res.json({ chats });
  } catch (err) {
    console.error('Get Chats Error:', err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};
