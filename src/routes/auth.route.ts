import express from 'express';
import { signUp } from '../controllers/auth/mincaAI/signup'; // Ensure this path is correct
import { login } from '../controllers/auth/mincaAI/login'; // Ensure this path is correct

const routerAuth = express.Router();

routerAuth.post('/signup', signUp);
routerAuth.post('/login', login);

export default routerAuth;
