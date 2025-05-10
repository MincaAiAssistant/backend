import axios from 'axios';
import { transformSessions, Message } from '../../utils/transformMessage';
import { sql } from '../../db/postgres';

export const getAllCustomerChat = async (req: any, res: any) => {
  try {
    const chats = await sql`
      SELECT
        cm.sessionid AS "sessionId",
        cm.content AS "lastMessage",
        cm.created_at AS "lastTimestamp",
        stats.total_messages AS "totalMessages"
      FROM customer_messages cm
      INNER JOIN (
        SELECT
          sessionid,
          MAX(created_at) AS latest_time,
          COUNT(*) AS total_messages
        FROM customer_messages
        GROUP BY sessionid
      ) stats
      ON cm.sessionid = stats.sessionid AND cm.created_at = stats.latest_time
      ORDER BY stats.latest_time DESC;
    `;

    return res.status(200).json(chats);
  } catch (err) {
    console.error('Error fetching customer chats:', err);
    return res.status(500).json({ error: 'Failed to fetch customer chats' });
  }
};
