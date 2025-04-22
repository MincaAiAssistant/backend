import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// === CONFIG ===
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});

export const pc_index = pinecone.Index(
  process.env.INDEX_NAME as string,
  process.env.INDEX_HOST as string
);
