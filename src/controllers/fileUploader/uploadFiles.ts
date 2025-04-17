import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import s3 from '../../db/s3';

export const uploadFilesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const files = req.files as Express.Multer.File[];
  const userId = (req as any).user.userid;

  if (!files || files.length === 0) {
    res.status(400).send('No files uploaded');
    return;
  }

  try {
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const key = `knowledge-base/user_${userId}/${file.originalname}`;

        const uploadParams: PutObjectCommandInput = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(uploadParams));
        return { filename: file.originalname, key };
      })
    );

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: uploadResults,
    });
  } catch (err) {
    console.error('S3 Upload Error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};
