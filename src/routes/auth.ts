import express from 'express';
import { loginUser } from '../../helper/auth/login'; // Ensure this path is correct
import { authenticateToken } from '../../middleware/authMiddleware';
import { getUserInfo } from '../../helper/auth/getInfo';

const routerAuth = express.Router();

routerAuth.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const response = await loginUser(email, password);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(400).json({
      error: error instanceof Error ? error.message : 'Login failed.',
    });
  }
});

routerAuth.get('/info', authenticateToken, getUserInfo);

export default routerAuth;
