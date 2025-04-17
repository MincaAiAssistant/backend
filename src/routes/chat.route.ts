import express from 'express';
import { createChat } from '../controllers/chat/createChat';
import { getChatById } from '../controllers/chat/getChatByID';
import { getAllChats } from '../controllers/chat/getAllChats';
import { deleteChat } from '../controllers/chat/deleteChat';
import { updateChat } from '../controllers/chat/updateChat';
import { authenticateToken } from '../middleware/authMiddleware';

const routerChat = express.Router();

routerChat.post('/', authenticateToken, createChat);
routerChat.get('/:chatid', authenticateToken, getChatById);
routerChat.get('/', authenticateToken, getAllChats);
routerChat.delete('/:chatid', authenticateToken, deleteChat);
routerChat.put('/:chatid', authenticateToken, updateChat);

export default routerChat;
