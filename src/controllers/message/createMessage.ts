import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sql } from '../../db/postgres';
import axios from 'axios';
import multer from 'multer';
import FormData from 'form-data';
import dotenv from 'dotenv';

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
      // 1. Insert user message
      const userMessageId = uuidv4();
      const userMessage = await sql`
        INSERT INTO messages (messageid, chatid, parent_message_id, role, content)
        VALUES (${userMessageId}, ${chatid}, ${parent_message_id || null}, 'user', ${question})
        RETURNING *;
      `;

      let apiResponse;

      if (files.length === 0) {
        // 2A. No attachments – simple API call
        apiResponse = await axios.post(`${process.env.AI_AGENT_API}`, {
          question,
          chatId: chatid,
        });
      } else {
        // 2B. Handle file upload using FormData
        const formData = new FormData();

        files.forEach((file) => {
          formData.append('files', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
          });
        });

        const uploads = await axios.post(
          `${process.env.ATTACHMENT_API}`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
          }
        );

        const transformedData = uploads.data.map((item: any) => ({
          name: item.name,
          mime: item.mimeType,
          data: item.content,
          type: 'file:full',
        }));

        apiResponse = await axios.post(`${process.env.AI_AGENT_API}`, {
          question,
          uploads: transformedData,
          chatId: chatid,
        });
      }

      // 3. Get assistant's response
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
        user: userMessage[0],
        assistant: assistantMessage[0],
      });
    } catch (err) {
      console.error('Create message error:', err);
      return res
        .status(500)
        .json({ error: 'Failed to create message with assistant response' });
    }
  });
};
