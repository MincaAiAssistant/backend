import { Request, Response } from 'express';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import s3 from '../../db/s3';

dotenv.config();

export const getAllFiles = async (req: Request, res: Response) => {
  const userid = (req as any).user.userid;
  const bucket = process.env.S3_BUCKET_NAME!;
  const prefix = `uploads/user_${userid}/`;

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    const data = await s3.send(command);

    const files =
      data.Contents?.map((item) => ({
        key: item.Key,
        lastModified: item.LastModified,
        size: item.Size,
      })) || [];

    res.json({ files });
  } catch (error) {
    console.error('S3 List Error:', error);
    res.status(500).json({ error: 'Failed to list user files' });
  }
};
