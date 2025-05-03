import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sql } from '../../db/postgres';
import axios from 'axios';
import multer from 'multer';
import dotenv from 'dotenv';
import { transformUploadedFiles } from '../../utils/extractText';

dotenv.config();

// Middleware to handle file uploads
const uploadMiddleware = multer().array('files');

export const createMessage = async (req: Request, res: Response) => {
  uploadMiddleware(req, res, async (uploadErr: any) => {
    if (uploadErr) {
      return res.status(400).json({ error: 'File upload error' });
    }

    const { parent_message_id, question } = req.body;
    const chatid = req.params.chatid;

    if (!chatid || !question) {
      return res.status(400).json({ error: 'Missing chat ID or question' });
    }

    try {
      // Determine chat type and set appropriate agent API
      const [{ type: chatType }] = await sql`
        SELECT type FROM public.chats WHERE chatid = ${chatid}
      `;

      let aiAgentAPI = process.env.AI_AGENT_API_POLICY;
      if (chatType === 'sales') {
        aiAgentAPI = process.env.AI_AGENT_API_SALES;
      }

      // Handle uploaded files
      const files = (req.files as Express.Multer.File[]) || [];
      let transformedData: any[] = [];
      let attachmentsMeta: any[] = [];

      if (files.length > 0) {
        transformedData = await transformUploadedFiles(files);
        attachmentsMeta = await transformUploadedFiles(files, true);
      }

      // Insert user message
      const userMessageId = uuidv4();
      const [userMessage] = await sql`
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

      // Call AI agent API
      const apiResponse = await axios.post(`${aiAgentAPI}`, {
        question,
        chatId: chatid,
        ...(transformedData.length > 0 && { uploads: transformedData }),
      });

      // Extract assistant response
      const assistantContent =
        apiResponse.data?.text ||
        'Sorry, something went wrong. Please try again.';

      // Insert assistant message
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

      // Send response
      return res.status(201).json({
        user: userMessage,
        assistant: assistantMessage,
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
