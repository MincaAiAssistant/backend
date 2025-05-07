import express from 'express';
import { storeHubspotTokens } from '../controllers/auth/hubSpot/storeHubspotTokens';
import { authenticateToken } from '../middleware/authMiddleware';
import { hubspotCallback } from '../controllers/auth/hubSpot/hubspotCallback';
import { getAccessTokenOfUser } from '../controllers/auth/hubSpot/getAccesTokenOfUser';
import { authorizeUserHubspot } from '../controllers/auth/hubSpot/authorizeUser';

const routerHubspot = express.Router();

routerHubspot.post('/store-tokens', authenticateToken, storeHubspotTokens);
routerHubspot.get('/callback', hubspotCallback);
routerHubspot.get('/access-token', authenticateToken, getAccessTokenOfUser);
routerHubspot.get('/authorize', authenticateToken, authorizeUserHubspot);

export default routerHubspot;
