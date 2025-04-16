import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sql } from '../../db/postgres';
/**
 * Handles user login.
 * @param email - The email of the user.
 * @param password - The password provided by the user.
 * @returns A message indicating success or failure.
 */
export const loginUser = async (email: string, password: string) => {
  try {
    if (!sql) {
      throw new Error('Database connection failed.');
    }

    // Fetch user by email
    const result = await sql`
      SELECT userID, name,username, email, password, avatar FROM Users WHERE email = ${email}
    `;

    if (result.length === 0) {
      throw new Error('Invalid email or password.');
    }

    const user = result[0];

    // const isMatch = await bcrypt.compare(password, user.password);
    if (password !== user.password) {
      throw new Error('Invalid email or password.');
    }

    const roleResult = await sql`
        SELECT CASE 
            WHEN t.userid IS NOT NULL THEN 'teacher'
            WHEN s.userid IS NOT NULL THEN 'student'
            ELSE 'unknown'
        END AS role
        FROM users u
        LEFT JOIN teachers t ON u.userid = t.userid
        LEFT JOIN students s ON u.userid = s.userid
        WHERE u.email = ${email}
    `;
    const role = roleResult[0].role;
    const token = jwt.sign(
      {
        userID: user.userid,
        userName: user.username,
        name: user.name,
        role: role,
      }, // Payload
      process.env.JWT_SECRET as string, // Secret key from .env
      { expiresIn: '365h' } // Token expiry time
    );
    const avatar =
      '"https://i.ytimg.com/vi/znz56qfpVW0/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDbkNoz11aQGDk8bupxHyhmhDEv4Q"';
    return {
      data: {
        email: user.email,
        userName: user.username,
        name: user.name,
        avatar: user.avatar,
      },
      role: role,
      token: token,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error instanceof Error ? error.message : 'Login failed.');
  }
};
