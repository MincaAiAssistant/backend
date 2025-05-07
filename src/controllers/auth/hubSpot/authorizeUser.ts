const CLIENT_ID = process.env.HUBSPOT_CLIENT_ID,
  REDIRECT_URI = process.env.REDIRECT_URI;

export const authorizeUserHubspot = async (req: any, res: any) => {
  const userId = (req as any).user.userid;
  const state = userId; // Optional
  const authorizeUrl = `https://app.hubspot.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=crm.objects.companies.read%20oauth&state=${state}`;
  res.json({ url: authorizeUrl });
};
