import { sql } from '../../db/postgres';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

export const createChat = async (req: Request, res: Response) => {
  const userid = (req as any).user.userid;
  const { title } = req.body;

  try {
    const chatid = uuidv4();
    const result = await sql`
      INSERT INTO chats (chatid, userid, title)
      VALUES (${chatid}, ${userid}, ${title})
      RETURNING *
    `;
    res.status(201).json({ chat: result[0] });
  } catch (err) {
    console.error('Create Chat Error:', err);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};
