import { sql } from '../../db/postgres';
import { Chat } from '../../models/chat';

export const getChatById = async (req: any, res: any) => {
  const userid = (req as any).user.userid;
  const { chatid } = req.params;

  try {
    const chat = (await sql`
        SELECT * FROM chats
        WHERE chatid = ${chatid} AND userid = ${userid}
      `) as Chat[];

    if (chat.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ chat: chat[0] });
  } catch (err) {
    console.error('Get Chat Error:', err);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
};
