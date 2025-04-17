import express, { Request, Response } from 'express';
import multer from 'multer';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import s3 from '../db/s3';
import path from 'path';
import dotenv from 'dotenv';
import { uploadFileHandler } from '../controllers/fileUploader/uploadFiles';
import { uploadFileMiddleware } from '../middleware/multerMiddleware';

dotenv.config();

const routerUpload = express.Router();

// Multer config to read file into memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

routerUpload.post('/:userId', uploadFileMiddleware, uploadFileHandler);

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
routerUpload.delete(
  '/files/:userId/:fileName',
  async (req: Request, res: Response) => {
    const { userId, fileName } = req.params;
    const key = `uploads/user_${userId}/${fileName}`;

    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: key,
        })
      );

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('S3 Delete Error:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  }
);

export default routerUpload;
