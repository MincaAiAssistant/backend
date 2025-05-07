import { getValidAccessToken } from '../../../utils/hubspot/getHubspotAccessToken';

export const getAccessTokenOfUser = async (req: any, res: any) => {
  const userId = (req as any).user.userid;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const accessToken = await getValidAccessToken(userId);
    if (!accessToken) {
      return res.status(404).json({ error: 'No valid access token found' });
    }

    return res.status(200).json({ hubspot_access_token: accessToken });
  } catch (error) {
    console.error('Error fetching HubSpot access token:', error);
    return res
      .status(500)
      .json({ error: 'Failed to fetch HubSpot access token' });
  }
};
