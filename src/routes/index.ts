import routerAuth from './auth.route';
import routerChat from './chat.route';
import routerUpload from './knowledge-base.route';
import routerHubspot from './hubspot.route';
import express from 'express';
const router = express.Router();

router.use('/auth', routerAuth);
router.use('/chat', routerChat);
router.use('/knowledge-base', routerUpload);
router.use('/hubspot', routerHubspot);

export default router;
