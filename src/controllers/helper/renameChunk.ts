import { pc_index } from '../../db/pinecone';
const NAMESPACE = 'org_demo';

export const renameFileChunks = async (
  userid: string,
  oldFileName: string,
  newFileName: string,
  maxChunks = 50
) => {
  try {
    const vectorsToReinsert = [];

    for (let i = 0; i < maxChunks; i++) {
      const oldId = `${userid}_${oldFileName}_${i}`;
      const newId = `${userid}_${newFileName}_${i}`;

      // 🧠 Fetch the vector by ID
      const res = await pc_index.namespace(NAMESPACE).fetch([oldId]);
      const vector = res.records[oldId];

      if (vector) {
        vectorsToReinsert.push({
          id: newId,
          values: vector.values,
          metadata: {
            ...vector.metadata,
            document_name: newFileName,
            chunk_index: i,
          },
        });
      }
    }

    if (vectorsToReinsert.length > 0) {
      // ✅ Reinsert with new IDs
      await pc_index.namespace(NAMESPACE).upsert(vectorsToReinsert);

      // 🗑️ Delete the old ones
      const oldIds = vectorsToReinsert.map(
        (v) => `${userid}_${oldFileName}_${v.metadata.chunk_index}`
      );
      await pc_index.namespace(NAMESPACE).deleteMany(oldIds);

      console.log(
        `✅ Renamed ${vectorsToReinsert.length} chunks from "${oldFileName}" to "${newFileName}"`
      );
    } else {
      console.log('⚠️ No vectors found to rename.');
    }
  } catch (error) {
    console.error('❌ Rename error:', error);
  }
};
