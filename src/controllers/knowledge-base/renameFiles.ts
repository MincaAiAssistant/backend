import { Request, Response } from 'express';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import s3 from '../../db/s3';
import mime from 'mime-types';
import { renameFileChunks } from '../helper/renameChunk';

dotenv.config();

export const renameFilesHandler = async (req: any, res: any) => {
  const userid = (req as any).user.userid;
  const { oldFilename, newFilename } = req.body;

  if (!oldFilename || !newFilename) {
    return res
      .status(400)
      .json({ error: 'Both oldFilename and newFilename are required' });
  }

  const oldMime = mime.lookup(oldFilename);
  const newMime = mime.lookup(newFilename);

  if (oldMime !== newMime) {
    return res.status(400).json({
      error: `Cannot rename file to a different type (${oldMime} → ${newMime})`,
    });
  }

  if (oldFilename === newFilename) {
    return res
      .status(400)
      .json({ error: 'Old and new filenames are the same' });
  }

  const bucket = process.env.S3_BUCKET_NAME!;
  const prefix = `knowledge-base/user_${userid}/`;
  const oldKey = `${prefix}${oldFilename}`;
  const newKey = `${prefix}${newFilename}`;

  try {
    // Check if old file exists
    try {
      await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: oldKey }));
    } catch (err: any) {
      if (err.name === 'NotFound') {
        return res.status(404).json({ error: 'The file does not exist' });
      }
      throw err; // Unexpected error
    }

    // Check if new file already exists
    try {
      await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: newKey }));
      return res
        .status(400)
        .json({ error: 'A file with the new filename already exists' });
    } catch (err: any) {
      if (err.name !== 'NotFound') {
        throw err;
      }
    }

    // Copy old file to new key
    await s3.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${oldKey}`,
        Key: newKey,
      })
    );
    await renameFileChunks(userid, oldFilename, newFilename, 50);

    // Delete old file
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: oldKey }));

    res.json({ message: 'File renamed successfully' });
  } catch (error) {
    console.error('Rename Error:', error);
    res.status(500).json({ error: 'Failed to rename file' });
  }
};
