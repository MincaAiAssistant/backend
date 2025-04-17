import express, { Request, Response } from 'express';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import s3 from '../db/s3';
import dotenv from 'dotenv';
import { uploadFilesHandler } from '../controllers/fileUploader/uploadFiles';
import { uploadFilesMiddleware } from '../middleware/multerMiddleware';
import { getAllFiles } from '../controllers/fileUploader/getAllFiles';
import { authenticateToken } from '../middleware/authMiddleware';

dotenv.config();

const routerUpload = express.Router();

routerUpload.post(
  '/files',
  uploadFilesMiddleware,
  authenticateToken,
  uploadFilesHandler
);

routerUpload.get('/files', authenticateToken, getAllFiles);
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
