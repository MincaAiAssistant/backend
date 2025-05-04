import axios from 'axios';
import { transformMessages, RawMessage } from '../../utils/transformMessage';

export const getCustomerChatBySessionID = async (req: any, res: any) => {
  try {
    const accessToken = process.env.CUSTOMER_CHAT_ACCESS_TOKEN;
    const { sessionId } = req.params;
    const url =
      process.env.AI_AGENT_API_CUSTOMER_CHAT +
      `?sessionId=${sessionId}&order=ASC`;
    const response = await axios.get<RawMessage[]>(url as string, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const sessionData = response.data.filter(
      (message) => message.sessionId === sessionId
    );
    const transformed = transformMessages(sessionData, sessionId);
    res.json(transformed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch or process session data' });
  }
};
