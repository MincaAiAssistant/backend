import express from 'express';
import { createChat } from '../controllers/chat/createChat';
import { getChatById } from '../controllers/chat/getChatById';
import { getAllChats } from '../controllers/chat/getAllChats';
import { deleteChat } from '../controllers/chat/deleteChat';
import { updateChat } from '../controllers/chat/updateChat';
import { createMessage } from '../controllers/message/createMessage';

import { authenticateToken } from '../middleware/authMiddleware';

import multer from 'multer';

const upload = multer();

const routerChat = express.Router();

routerChat.post('/', authenticateToken, createChat);
routerChat.get('/:chatid', authenticateToken, getChatById);
routerChat.get('/', authenticateToken, getAllChats);
routerChat.delete('/:chatid', authenticateToken, deleteChat);
routerChat.put('/:chatid', authenticateToken, updateChat);

routerChat.post(
  '/:chatid/message',
  authenticateToken,
  upload.none(),
  createMessage
);

export default routerChat;
