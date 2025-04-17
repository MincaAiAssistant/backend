import express from 'express';
import http from 'http';
import { limiter } from './utils/rateLimiter';
import routerAuth from './routes/auth.route';
import routerChat from './routes/chat.route';
import routerUpload from './routes/kbase.route';
import helmet from 'helmet';
import cors from 'cors';

export const app = express();
export const server = http.createServer(app);

app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(limiter);

app.use(express.json());

app.use('/auth', routerAuth);
app.use('/knowledge-base', routerUpload);
app.use('/chat', routerChat);
