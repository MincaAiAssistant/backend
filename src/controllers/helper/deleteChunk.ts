import { pc_index } from '../../db/pinecone';

const NAMESPACE = 'org_demo';

export const deleteAllChunksForFile = async (
  userid: string,
  fileName: string,
  maxChunks = 50 // Adjust based on your expected upper bound
) => {
  const idsToDelete = Array.from(
    { length: maxChunks },
    (_, i) => `${userid}_${fileName}_${i}`
  );

  try {
    await pc_index.namespace(NAMESPACE).deleteMany(idsToDelete as string[]);
    console.log(
      `🗑️ Deleted chunks [0 - ${maxChunks - 1}] for file "${fileName}"`
    );
  } catch (error) {
    console.error(`❌ Failed to delete chunks for "${fileName}":`, error);
  }
};
