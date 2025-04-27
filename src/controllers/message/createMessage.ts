import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sql } from '../../db/postgres';
import axios from 'axios';
import multer from 'multer';
import dotenv from 'dotenv';
import { transformUploadedFiles } from '../../utils/extractText';

dotenv.config();

const uploadMiddleware = multer().array('files'); // Multer to handle file uploads

export const createMessage = async (req: Request, res: Response) => {
  uploadMiddleware(req, res, async (uploadErr: any) => {
    if (uploadErr) {
      return res.status(400).json({ error: 'File upload error' });
    }

    const { parent_message_id, question } = req.body;
    const chatid = req.params.chatid;
    const files = (req.files as Express.Multer.File[]) || [];

    if (!chatid || !question) {
      return res.status(400).json({ error: 'Missing chat ID or question' });
    }

    try {
      let transformedData: any[] = [];
      let attachmentsMeta: any[] = [];

      if (files.length > 0) {
        transformedData = await transformUploadedFiles(files);
        attachmentsMeta = await transformUploadedFiles(files, true);
      }

      // 1. Insert user message (with attachments metadata if any)
      const userMessageId = uuidv4();
      const userMessage = await sql`
        INSERT INTO messages (messageid, chatid, parent_message_id, role, content, attachments)
        VALUES (
          ${userMessageId},
          ${chatid},
          ${parent_message_id || null},
          'user',
          ${question},
          ${JSON.stringify(attachmentsMeta)}
        )
        RETURNING *;
      `;

      // 2. Send to assistant
      const apiResponse = await axios.post(`${process.env.AI_AGENT_API}`, {
        question,
        chatId: chatid,
        ...(transformedData.length > 0 && { uploads: transformedData }),
      });

      // 3. Get assistant response
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

      // 5. Respond with both messages and attachments
      return res.status(201).json({
        user: userMessage[0],
        assistant: assistantMessage[0],
        attachments: attachmentsMeta,
      });
    } catch (err) {
      console.error('Create message error:', err);
      return res
        .status(500)
        .json({ error: 'Failed to create message with assistant response' });
    }
  });
};
