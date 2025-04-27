import { pc_index, openai } from '../../db/pinecone';

// === 1. Token-safe splitter ===
const chunkTextIntoSegments = (
  text: string,
  maxTokens: number = 1000
): string[] => {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text]; // Basic sentence splitting
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length / 4 > maxTokens) {
      chunks.push(currentChunk);
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};

// === 2. Generate OpenAI embedding ===
const getEmbedding = async (text: string): Promise<number[]> => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });

  return response.data[0].embedding;
};

const NAMESPACE = 'org_demo';

// === 3. Upsert chunk(s) safely ===
export const upsertChunk = async (
  chunkText: string,
  fileName: string,
  userid: string,
  chunkIndex: number
) => {
  const chunks = chunkTextIntoSegments(chunkText, 1000);

  for (let i = 0; i < chunks.length; i++) {
    const text = chunks[i];
    try {
      const embeddingVector = await getEmbedding(text);
      const chunkId = `${userid}_${fileName}_${chunkIndex + i}`; // unique per real chunk

      const metadata = {
        org_id: 'org_demo',
        document_name: fileName,
        uploaded_by: userid,
        chunk_index: chunkIndex + i,
        text,
        created_at: new Date().toISOString(),
      };

      const vector = {
        id: chunkId,
        values: embeddingVector,
        metadata: metadata as Record<string, string | number | boolean>,
      };

      await pc_index.namespace(NAMESPACE).upsert([vector]);
      console.log(
        `✅ Chunk ${chunkIndex + i} upserted successfully to Pinecone!`
      );
    } catch (error) {
      console.error(`❌ Failed to upsert chunk ${chunkIndex + i}:`, error);
    }
  }
};
