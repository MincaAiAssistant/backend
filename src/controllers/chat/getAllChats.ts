import { sql } from '../../db/postgres';
import { Chat } from '../../models/chat';

export const getAllChats = async (req: any, res: any) => {
  const userid = (req as any).user.userid;
  const { type } = req.query;
  if (!type) {
    return res.status(400).json({ error: 'Type is required' });
  }

  try {
    const chats = (await sql`
        SELECT * FROM chats
        WHERE userid = ${userid} AND type = ${type}
        ORDER BY updated_at DESC
      `) as Chat[];
    res.json({ chats });
  } catch (err) {
    console.error('Get Chats Error:', err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};
