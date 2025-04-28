import { sql } from '../../db/postgres';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from '../../models/chat';

export const createChat = async (req: any, res: any) => {
  const userid = (req as any).user.userid;
  const { title } = req.body;
  const { type } = req.query;
  if (!type) {
    return res.status(400).json({ error: 'Type is required' });
  }

  try {
    const chatid = uuidv4();
    const result = await sql`
      INSERT INTO chats (type,chatid, userid, title)
      VALUES (${type}, ${chatid}, ${userid}, ${title})
      RETURNING *
    `;
    const chat = result[0] as Chat;
    res.status(201).json({ chat });
  } catch (err) {
    console.error('Create Chat Error:', err);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};
