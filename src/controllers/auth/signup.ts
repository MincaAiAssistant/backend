import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sql } from '../../db/postgres';
import { User } from '../../models/user';

/**
 * Function to create a new user with hashed password and return a token.
 * @param req Express request object with user data from token.
 * @param res Express response object.
 */
export const signUp = async (req: any, res: any) => {
  const { email, username, password } = req.body;

  try {
    // Check if email already exists
    const existingEmail = await sql`
      SELECT userid FROM users WHERE email = ${email}
    `;

    if (existingEmail.length > 0) {
      return res.status(409).json({
        error: `User with email "${email}" already exists.`,
      });
    }

    const existingUsername = await sql`
      SELECT userid FROM users WHERE username = ${username}
    `;

    if (existingUsername.length > 0) {
      return res.status(409).json({
        error: `User with username "${username}" already exists.`,
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await sql`
      INSERT INTO users (userid, email, username, password)
      VALUES (gen_random_uuid(), ${email}, ${username}, ${hashedPassword})
      RETURNING userid, email, username
    `;

    const user = result[0] as User;

    const token = jwt.sign(
      {
        userid: user.userid,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1y' }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
