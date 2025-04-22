export const chunkTextIntoSegments = (
  text: string,
  maxTokens: number = 8000
): string[] => {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text]; // Basic sentence splitting
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    // Naively estimate token count (~4 characters per token)
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
