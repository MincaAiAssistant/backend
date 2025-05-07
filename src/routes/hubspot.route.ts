import express from 'express';
import { storeHubspotTokens } from '../controllers/auth/hubSpot/storeHubspotTokens';
import { authenticateToken } from '../middleware/authMiddleware';
import { hubspotCallback } from '../controllers/auth/hubSpot/hubspotCallback';

const routerHubspot = express.Router();

routerHubspot.post('/store-tokens', authenticateToken, storeHubspotTokens);
routerHubspot.post('/callback', authenticateToken, hubspotCallback);

export default routerHubspot;
