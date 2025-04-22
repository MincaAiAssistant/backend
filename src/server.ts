import express from 'express';
import http from 'http';
import { limiter } from './utils/rateLimiter';
import router from './routes';
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
app.use('/', router);
