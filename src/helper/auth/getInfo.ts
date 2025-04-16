/**
 * Function to get user info from the request.
 * @param req Express request object with user data from token.
 * @param res Express response object.
 */
export const getUserInfo = (req: any, res: any) => {
  const user = (req as any).user; // Explicitly cast req to include `user`

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: No user data found' });
  }

  return res.status(200).json({
    userID: user.userID,
    userName: user.userName,
    name: user.name,
    role: user.role,
  });
};
