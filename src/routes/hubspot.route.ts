import express from 'express';
import { storeHubspotTokens } from '../controllers/auth/hubSpot/storeHubspotTokens';
import { authenticateToken } from '../middleware/authMiddleware';

const routerHubspot = express.Router();

routerHubspot.post('/store-tokens', authenticateToken, storeHubspotTokens);

export default routerHubspot;
