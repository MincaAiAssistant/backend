import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { v4 as uuidv4 } from 'uuid';

// === CONFIG ===
const openai = new OpenAI({
  apiKey:
    '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',
});
const pinecone = new Pinecone({
  apiKey:
    'pcsk_3NyaRB_MG8hzgcPD18LeoXzcctEkLYcte5CfHEeaoZiHaARzVgANDhinTAvEXUbkaND3jv',
});
const index = pinecone.Index('mincaai');

const NAMESPACE = 'org_42';

// === 1. Define your input text ===
const chunkText = 'This is the chunk text...';

// === 2. Generate embedding from OpenAI ===
const getEmbedding = async (text) => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });

  return response.data[0].embedding;
};

// === 3. Upsert chunk to Pinecone ===
const upsertChunk = async () => {
  const embeddingVector = await getEmbedding(chunkText);
  const chunkId = uuidv4();

  const metadata = {
    org_id: 'org_42',
    document_id: 'doc_001',
    document_name: 'manual.pdf',
    uploaded_by: 'user_007',
    chunk_index: 0,
    text: chunkText,
    created_at: new Date().toISOString(),
  };

  const vector = {
    id: chunkId,
    values: embeddingVector,
    metadata: metadata,
  };

  // Uncomment to perform the upsert operation
  // await index.upsert([vector]);
  console.log('✅ Chunk upserted successfully to Pinecone!');
};

upsertChunk().catch(console.error);
