import express from 'express';
import http from 'http';
import { limiter } from './utils/rateLimiter';
import routerAuth from './routes/auth';
import routerUpload from './routes/upload';
import helmet from 'helmet';
import cors from 'cors';

export const app = express();
export const server = http.createServer(app);

app.use(helmet());

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://d3rn5uwzh2n6e4.cloudfront.net',
    ],
    credentials: true,
  })
);

app.use(limiter);

app.use(express.json());

app.use('/auth', routerAuth);
app.use('/upload', routerUpload);
