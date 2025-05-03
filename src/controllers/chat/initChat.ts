import { Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

import { sql } from '../../db/postgres';
import { generateChatDescription, generateAgentName } from '../../utils/openAI';
import { transformUploadedFiles } from '../../utils/extractText';

// Middleware to handle multiple file uploads
const uploadMiddleware = multer().array('files');

export const initChat = (req: Request, res: Response) => {
  uploadMiddleware(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ error: 'File upload error' });
    }

    const userid = (req as any).user?.userid;
    const { question } = req.body;
    const chatType = req.query.type as string;
    const files = (req.files as Express.Multer.File[]) || [];

    if (!userid || !question) {
      return res.status(400).json({ error: 'Missing userid or question' });
    }

    try {
      // Select appropriate agent endpoint based on chat type
      const aiAgentAPI =
        chatType === 'sales'
          ? process.env.AI_AGENT_API_SALES
          : process.env.AI_AGENT_API_POLICY;

      const chatid = uuidv4();
      const title = await generateAgentName(question);
      const description = await generateChatDescription(question);

      // 1. Create a new chat
      const [chat] = await sql`
        INSERT INTO chats (type, chatid, userid, title, description)
        VALUES (${chatType}, ${chatid}, ${userid}, ${title}, ${description})
        RETURNING *;
      `;

      // 2. Process file attachments (if any)
      const attachmentsMeta =
        files.length > 0 ? await transformUploadedFiles(files, true) : [];

      // 3. Store user's initial message
      const userMessageId = uuidv4();
      const [userMessage] = await sql`
        INSERT INTO messages (messageid, chatid, parent_message_id, role, content, attachments)
        VALUES (
          ${userMessageId},
          ${chatid},
          NULL,
          'user',
          ${question},
          ${JSON.stringify(attachmentsMeta)}
        )
        RETURNING *;
      `;

      // 4. Prepare payload and call AI agent
      const payload: any = { question, chatId: chatid };
      if (files.length > 0) {
        payload.uploads = await transformUploadedFiles(files);
      }

      const apiResponse = await axios.post(aiAgentAPI || '', payload);

      // 5. Extract assistant response
      const assistantContent =
        apiResponse.data?.text ||
        'Sorry, something went wrong. Please try again.';

      // 6. Save assistant's message
      const assistantMessageId = uuidv4();
      const [assistantMessage] = await sql`
        INSERT INTO messages (messageid, chatid, parent_message_id, role, content)
        VALUES (
          ${assistantMessageId},
          ${chatid},
          ${userMessageId},
          'assistant',
          ${assistantContent}
        )
        RETURNING *;
      `;

      // 7. Return final response
      return res.status(201).json({
        chat,
        user: userMessage,
        assistant: assistantMessage,
        attachments: attachmentsMeta,
      });
    } catch (err) {
      console.error('Init Chat Error:', err);
      return res.status(500).json({ error: 'Failed to initialize chat' });
    }
  });
};
