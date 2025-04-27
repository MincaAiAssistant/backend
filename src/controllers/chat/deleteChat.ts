import { sql } from '../../db/postgres';

export const deleteChat = async (req: any, res: any) => {
  const userid = (req as any).user.userid;
  const { chatid } = req.params;

  try {
    const deleted = await sql`
        DELETE FROM chats
        WHERE chatid = ${chatid} AND userid = ${userid}
        RETURNING *
      `;

    if (deleted.length === 0) {
      return res
        .status(404)
        .json({ error: 'Chat not found or not owned by user' });
    }

    res.json({ message: 'Chat deleted successfully' });
  } catch (err) {
    console.error('Delete Chat Error:', err);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};
