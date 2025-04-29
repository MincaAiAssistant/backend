import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sql } from '../../../db/postgres';
import { User } from '../../../models/user';

/**
 * Function to authenticate a user and return a JWT token.
 * @param req Express request object with login credentials.
 * @param res Express response object.
 */
export const login = async (req: any, res: any) => {
  const { email, password } = req.body;

  // Check for missing fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Query user by email
    const result = await sql`
      SELECT userid, email, username, password
      FROM users
      WHERE email = ${email}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Manually cast the first result to User
    const user = result[0] as User;

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userid: user.userid,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1y' }
    );

    // Return response with user and token
    res.status(200).json({
      user: {
        userid: user.userid,
        email: user.email,
        username: user.username,
      },
      token,
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
