import { sql } from '../../db/postgres';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { generateChatTitle } from '../../utils/openAI';

export const initChat = async (req: any, res: any) => {
  const userid = (req as any).user.userid;
  const { question } = req.body;

  if (!userid || !question) {
    return res.status(400).json({ error: 'Missing userid or question' });
  }

  try {
    const title = await generateChatTitle(question);
    const chatid = uuidv4();

    // 1. Create chat
    const chatResult = await sql`
      INSERT INTO chats (chatid, userid, title)
      VALUES (${chatid}, ${userid}, ${title})
      RETURNING *;
    `;

    // 2. Insert user message
    const userMessageId = uuidv4();
    const userMessage = await sql`
      INSERT INTO messages (messageid, chatid, parent_message_id, role, content)
      VALUES (${userMessageId}, ${chatid}, NULL, 'user', ${question})
      RETURNING *;
    `;

    // 3. Call external assistant API
    const apiResponse = await axios.post(`${process.env.AI_AGENT_API}`, {
      question,
      chatId: chatid,
    });

    const assistantContent =
      apiResponse.data?.text ||
      'Sorry, something went wrong. Please try again.';

    // 4. Insert assistant message
    const assistantMessageId = uuidv4();
    const assistantMessage = await sql`
      INSERT INTO messages (messageid, chatid, parent_message_id, role, content)
      VALUES (${assistantMessageId}, ${chatid}, ${userMessageId}, 'assistant', ${assistantContent})
      RETURNING *;
    `;

    // 5. Respond with both messages
    return res.status(201).json({
      chat: chatResult[0],
      user: userMessage[0],
      assistant: assistantMessage[0],
    });
  } catch (err) {
    console.error('Init Chat Error:', err);
    return res.status(500).json({ error: 'Failed to initialize chat' });
  }
};
