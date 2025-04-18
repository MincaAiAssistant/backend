import { sql } from '../../db/postgres';
import { Chat } from '../../models/chat';

export const updateChat = async (req: any, res: any) => {
  const userid = (req as any).user.userid;
  const { chatid } = req.params;
  const { title } = req.body;

  try {
    const chat = (await sql`
        UPDATE chats SET
          title = COALESCE(${title}, title),
          updated_at = CURRENT_TIMESTAMP
        WHERE chatid = ${chatid} AND userid = ${userid}
        RETURNING *
      `) as Chat[];

    if (chat.length === 0) {
      return res
        .status(404)
        .json({ error: 'Chat not found or not owned by user' });
    }

    res.json({ chat: chat[0] });
  } catch (err) {
    console.error('Update Chat Error:', err);
    res.status(500).json({ error: 'Failed to update chat' });
  }
};
