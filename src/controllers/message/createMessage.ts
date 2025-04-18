import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sql } from '../../db/postgres';
import axios from 'axios'; // assuming you're using axios to call external API

export const createMessage = async (req: Request, res: Response) => {
  const { parent_message_id, question } = req.body;
  const chatid = req.params.chatid;

  try {
    // 1. Insert user message
    const userMessageId = uuidv4();
    const userMessage = await sql`
        INSERT INTO messages (messageid, chatid, parent_message_id, role, content)
        VALUES (${userMessageId}, ${chatid}, ${parent_message_id || null}, 'user', ${question})
        RETURNING *;
      `;

    // 2. Call external assistant API
    const apiResponse = await axios.post(
      'https://mincaai-1.app.flowiseai.com/api/v1/prediction/fab685ba-769d-4e9f-b4a5-bf3c04ac546b',
      {
        question,
        chatId: chatid,
      }
    );

    const assistantContent =
      apiResponse.data.text || 'Sorry, something went wrong. Please try again.';

    // 3. Insert assistant message
    const assistantMessageId = uuidv4();
    const assistantMessage = await sql`
        INSERT INTO messages (messageid, chatid, parent_message_id, role, content)
        VALUES (${assistantMessageId}, ${chatid}, ${userMessageId}, 'assistant', ${assistantContent})
        RETURNING *;
      `;

    // 4. Return both messages
    res.status(201).json({
      user: userMessage[0],
      assistant: assistantMessage[0],
    });
  } catch (err) {
    console.error('Create message error:', err);
    res
      .status(500)
      .json({ error: 'Failed to create message with assistant response' });
  }
};
