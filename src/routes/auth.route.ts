import express from 'express';
import { signUp } from '../controllers/auth/signup'; // Ensure this path is correct
import { login } from '../controllers/auth/login'; // Ensure this path is correct

const routerAuth = express.Router();

routerAuth.post('/signup', signUp);
routerAuth.post('/login', login);

export default routerAuth;
