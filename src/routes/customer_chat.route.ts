import express from 'express';
import { getAllCustomerChat } from '../controllers/customer_chat/getAllCustomerChat';
import { getCustomerChatBySessionID } from '../controllers/customer_chat/getChatBySessionID';
import { initCustomerChat } from '../controllers/customer_chat/initCustomerChat';
import { createCustomerMessage } from '../controllers/customer_message/createCustomerChatMessage';

const routerCustomerChat = express.Router();

routerCustomerChat.get('/', getAllCustomerChat);
routerCustomerChat.post('/init', initCustomerChat);
routerCustomerChat.get('/:sessionId/message', getCustomerChatBySessionID);
routerCustomerChat.post('/:sessionid/message', createCustomerMessage);

export default routerCustomerChat;
