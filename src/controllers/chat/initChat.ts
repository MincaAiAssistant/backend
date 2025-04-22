import { sql } from '../../db/postgres';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { generateChatDescription, generateAgentName } from '../../utils/openAI';
import FormData from 'form-data';
import { Request, Response } from 'express';
import multer from 'multer';
import { transformUploadedFiles } from '../../utils/extractText';

const uploadMiddleware = multer().array('files');

export const initChat = (req: Request, res: Response) => {
  uploadMiddleware(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ error: 'File upload error' });
    }

    const userid = (req as any).user?.userid;
    const { question } = req.body;
    const files = (req.files as Express.Multer.File[]) || [];

    if (!userid || !question) {
      return res.status(400).json({ error: 'Missing userid or question' });
    }

    try {
      const description = await generateChatDescription(question);
      const agentName = await generateAgentName(question);
      const chatid = uuidv4();

      // 1. Create chat
      const chatResult = await sql`
        INSERT INTO chats (chatid, userid, title, description)
        VALUES (${chatid}, ${userid}, ${agentName}, ${description})
        RETURNING *;
      `;

      // 2. Insert user message
      const userMessageId = uuidv4();
      const userMessage = await sql`
        INSERT INTO messages (messageid, chatid, parent_message_id, role, content)
        VALUES (${userMessageId}, ${chatid}, NULL, 'user', ${question})
        RETURNING *;
      `;

      let apiResponse;

      if (files.length === 0) {
        // 3A. No file uploads
        apiResponse = await axios.post(`${process.env.AI_AGENT_API}`, {
          question,
          chatId: chatid,
        });
      } else {
        const transformedData = await transformUploadedFiles(files);

        apiResponse = await axios.post(`${process.env.AI_AGENT_API}`, {
          question,
          uploads: transformedData,
          chatId: chatid,
        });
      }

      // 4. Get assistant response
      const assistantContent =
        apiResponse.data?.text ||
        'Sorry, something went wrong. Please try again.';

      // 5. Insert assistant message
      const assistantMessageId = uuidv4();
      const assistantMessage = await sql`
        INSERT INTO messages (messageid, chatid, parent_message_id, role, content)
        VALUES (${assistantMessageId}, ${chatid}, ${userMessageId}, 'assistant', ${assistantContent})
        RETURNING *;
      `;

      // 6. Respond with chat and messages
      return res.status(201).json({
        chat: chatResult[0],
        user: userMessage[0],
        assistant: assistantMessage[0],
      });
    } catch (err) {
      console.error('Init Chat Error:', err);
      return res.status(500).json({ error: 'Failed to initialize chat' });
    }
  });
};
