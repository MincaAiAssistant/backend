import express, { Request, Response } from 'express';
import multer from 'multer';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import path from 'path';
import dotenv from 'dotenv';
import s3 from '../../db/s3';

dotenv.config();

// Multer config to read file into memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadFileHandler = async (
  req: Request,
  res: Response,
  next: Function
) => {
  const file = req.file;
  const userId = req.params.userId;

  if (!file) {
    return res.status(400).send('No file uploaded');
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
    // Upload the file to S3
    await s3.send(new PutObjectCommand(uploadParams));
    // Pass the key to the response
    res.status(200).json({ message: 'Uploaded successfully', key });
  } catch (err) {
    console.error('S3 Upload Error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};
