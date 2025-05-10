import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sql } from '../../db/postgres';
import axios from 'axios';
import multer from 'multer';
import dotenv from 'dotenv';
import { transformUploadedFiles } from '../../utils/extractText';

dotenv.config();

const uploadMiddleware = multer().array('files');

export const createCustomerMessage = async (req: Request, res: Response) => {
  uploadMiddleware(req, res, async (uploadErr: any) => {
    if (uploadErr) {
      return res.status(400).json({ error: 'File upload error' });
    }

    const { question } = req.body;
    const sessionid = req.params.sessionid;

    if (!sessionid || !question) {
      return res.status(400).json({ error: 'Missing session ID or question' });
    }

    try {
      // Check that the session exists
      const [chat] = await sql`
        SELECT sessionid FROM customer_chats WHERE sessionid = ${sessionid}
      `;
      if (!chat) {
        return res.status(404).json({ error: 'Chat session not found' });
      }

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
        INSERT INTO customer_messages (messageid, sessionid, role, content, attachments)
        VALUES (
          ${userMessageId},
          ${sessionid},
          'user',
          ${question},
          ${JSON.stringify(attachmentsMeta)}
        )
        RETURNING *;
      `;

      // Call AI agent
      const apiResponse = await axios.post(
        `${process.env.AI_AGENT_API_CUSTOMER_CHAT}`,
        {
          question,
          chatId: sessionid,
          ...(transformedData.length > 0 && { uploads: transformedData }),
        }
      );

      const assistantContent =
        apiResponse.data?.text ||
        'Sorry, something went wrong. Please try again.';

      // Insert assistant message
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
        user: userMessage,
        assistant: assistantMessage,
        attachments: attachmentsMeta,
      });
    } catch (err) {
      console.error('Create Customer Message error:', err);
      return res.status(500).json({
        error: 'Failed to create message with assistant response',
      });
    }
  });
};
