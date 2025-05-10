import { Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

import { sql } from '../../db/postgres';
import { transformUploadedFiles } from '../../utils/extractText';

const uploadMiddleware = multer().array('files');

export const initCustomerChat = (req: Request, res: Response) => {
  uploadMiddleware(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ error: 'File upload error' });
    }

    const { question } = req.body;
    const files = (req.files as Express.Multer.File[]) || [];

    if (!question) {
      return res.status(400).json({ error: 'Missing question' });
    }

    try {
      // 1. Create new customer chat
      const [customer_chat] = await sql`
        INSERT INTO customer_chats (sessionid, created_at, updated_at)
        VALUES (gen_random_uuid(), now(), now())
        RETURNING *;
      `;

      const sessionid = customer_chat.sessionid;

      // 2. Process file attachments (optional)
      const attachmentsMeta =
        files.length > 0 ? await transformUploadedFiles(files, true) : [];

      // 3. Save customer's message
      const customerMessageId = uuidv4();
      const [customerMessage] = await sql`
        INSERT INTO customer_messages (messageid, sessionid, role, content, attachments)
        VALUES (
          ${customerMessageId},
          ${sessionid},
          'user',
          ${question},
          ${JSON.stringify(attachmentsMeta)}
        )
        RETURNING *;
      `;

      // 4. Prepare payload for agent
      const payload: any = { question, chatId: sessionid };
      if (files.length > 0) {
        payload.uploads = await transformUploadedFiles(files);
      }

      // 5. Call AI agent
      const apiResponse = await axios.post(
        process.env.AI_AGENT_API_CUSTOMER_CHAT || '',
        payload
      );

      const assistantContent =
        apiResponse.data?.text ||
        'Sorry, something went wrong. Please try again.';

      // 6. Save assistant's reply
      const assistantMessageId = uuidv4();
      const [assistantMessage] = await sql`
        INSERT INTO customer_messages (messageid, sessionid, role, content)
        VALUES (
          ${assistantMessageId},
          ${sessionid},
          'assistant',
          ${assistantContent}
        )
        RETURNING *;
      `;

      return res.status(201).json({
        customer_chat: customer_chat,
        sessionid,
        user: customerMessage,
        assistant: assistantMessage,
        attachments: attachmentsMeta,
      });
    } catch (err) {
      console.error('Init Customer Chat Error:', err);
      return res.status(500).json({ error: 'Failed to initialize chat' });
    }
  });
};
