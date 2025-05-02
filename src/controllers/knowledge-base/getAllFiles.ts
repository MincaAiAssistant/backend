import { Request, Response } from 'express';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { File } from '../../models/file';
import dotenv from 'dotenv';
import s3 from '../../db/s3';
import path from 'path';

dotenv.config();

export const getAllFiles = async (req: Request, res: Response) => {
  const userId = (req as any).user.userid;

  try {
    const prefix = `knowledge-base/user_${userId}/`;
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME!,
      Prefix: prefix,
    });

    const result = await s3.send(command);
    const files = result.Contents || [];

    const collections: Record<
      string,
      Array<{ filename: string; size: number; lastModified: Date }>
    > = {};

    for (const file of files) {
      const key = file.Key!;
      const pathParts = key.split('/');
      if (pathParts.length < 4) continue;

      const collectionName = pathParts[2]; // knowledge-base/user_<id>/<collection>/<filename>
      const filename = pathParts.slice(3).join('/');

      if (!collections[collectionName]) {
        collections[collectionName] = [];
      }

      collections[collectionName].push({
        filename,
        size: file.Size || 0,
        lastModified: file.LastModified || new Date(0),
      });
    }

    const response = Object.entries(collections).map(([collection, files]) => ({
      collection,
      files,
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error('S3 List Error:', err);
    res.status(500).json({ error: 'Could not fetch files' });
  }
};
