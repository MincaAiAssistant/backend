import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

// Ensure DATABASE_URL is defined in the environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the environment variables');
}

// Create a database connection
export const sql = neon(process.env.DATABASE_URL);
