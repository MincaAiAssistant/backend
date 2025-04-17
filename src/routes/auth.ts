import express from 'express';
import { signUp } from '../helper/auth/signup'; // Ensure this path is correct

const routerAuth = express.Router();

routerAuth.post('/signup', signUp);

export default routerAuth;
