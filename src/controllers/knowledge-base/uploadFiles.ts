import { Request, Response, NextFunction } from 'express';
import { PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import s3 from '../../db/s3';
import { File } from '../../models/file';
import { transformUploadedFiles } from '../../utils/extractText';
import { upsertChunk } from '../helper/upsertChunk';

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
    const transformedFiles = await transformUploadedFiles(files);
    const currentTime = new Date();

    const uploadResults = await Promise.all(
      files.map(async (file, index) => {
        const key = `knowledge-base/user_${userId}/${file.originalname}`;

        const uploadParams: PutObjectCommandInput = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        // Match transformed content by index (assumes order is preserved)
        const transformed = transformedFiles[index];
        const content = transformed?.data;
        console.log('Transformed content:', content);

        // Optional: Skip or throw if content not found
        if (!content) {
          console.warn(`⚠️ No extracted content for ${file.originalname}`);
        } else {
          await upsertChunk(content, file.originalname, userId, 0); // 🔧 add chunkIndex = 0
        }

        await s3.send(new PutObjectCommand(uploadParams));

        return {
          filename: file.originalname,
          size: file.size,
          lastModified: currentTime,
        } as File;
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
