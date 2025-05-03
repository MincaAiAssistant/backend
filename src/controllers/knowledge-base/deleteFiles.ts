import { Request, Response } from 'express';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { deleteAllChunksForFile } from '../helper/deleteChunk';
import s3 from '../../db/s3';

export const DeleteFilesHandler = async (req: Request, res: Response) => {
  const { fileName } = req.params;
  const userid = (req as any).user.userid;
  const { collection } = req.params;
  const key = `knowledge-base/user_${userid}/${collection}/${fileName}`;

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
      })
    );
    await deleteAllChunksForFile(userid, fileName, 50);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('S3 Delete Error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};
