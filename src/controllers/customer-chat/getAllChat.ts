import axios from 'axios';
import { transformSessions, Message } from '../../utils/transformMessage';

export const getAllCustomerChat = async (req: any, res: any) => {
  try {
    const accessToken = process.env.CUSTOMER_CHAT_ACCESS_TOKEN;
    const url = process.env.AI_AGENT_API_CUSTOMER_CHAT + `&order=DESC`;
    const response = await axios.get<Message[]>(url as string, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const transformed = transformSessions(response.data);
    res.json(transformed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch or process session data' });
  }
};
