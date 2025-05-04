import express from 'express';
import { getAllCustomerChat } from '../controllers/customer-chat/getAllChat';
import { getCustomerChatBySessionID } from '../controllers/customer-chat/getChatBySessionID';
const routerCustomerChat = express.Router();

routerCustomerChat.get('/', getAllCustomerChat);
routerCustomerChat.get('/:sessionId', getCustomerChatBySessionID);

export default routerCustomerChat;
