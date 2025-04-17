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
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return res.status(409).json({
        error: `User with email "${email}" already exists.`,
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await sql`
      INSERT INTO users (id, email, username, password)
      VALUES (gen_random_uuid(), ${email}, ${username}, ${hashedPassword})
      RETURNING id, email, username
    `;

    const user = result[0] as User;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
