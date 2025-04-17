import express, { Request, Response } from 'express';
import multer from 'multer';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import s3 from '../db/s3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const routerUpload = express.Router();

// Multer config to read file into memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload route
routerUpload.post(
  '/:userId',
  upload.single('file'),
  async (req: any, res: any) => {
    const file = req.file;
    const userId = req.params.userId;

    if (!file) return res.status(400).send('No file uploaded');

    const fileExt = path.extname(file.originalname);
    const key = `uploads/user_${userId}/${Date.now()}_${file.originalname}`;

    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await s3.send(new PutObjectCommand(uploadParams));
      res.status(200).json({ message: 'Uploaded successfully', key });
    } catch (err) {
      console.error('S3 Upload Error:', err);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
);

routerUpload.get('/files/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const bucket = process.env.S3_BUCKET_NAME!;
  const prefix = `uploads/user_${userId}/`;

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
});

export default routerUpload;
