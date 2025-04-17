import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import s3 from '../../db/s3';

export const uploadFileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const file = req.file as Express.Multer.File;
  const userId = req.params.userId;

  if (!file) {
    res.status(400).send('No file uploaded');
  }

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
};
