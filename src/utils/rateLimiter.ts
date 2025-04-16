import rateLimit from 'express-rate-limit';

// Limit requests to 100 per 1 minutes per IP
export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { error: 'Too many requests, please try again later.' },
  headers: true, // Send rate limit info in headers
});
