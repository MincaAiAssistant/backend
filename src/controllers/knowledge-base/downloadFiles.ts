import { Request, Response } from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3 from '../../db/s3';

export const DownloadFilesHandler = async (req: Request, res: Response) => {
  const userid = (req as any).user.userid;
  const { fileName } = req.params;
  const { collection } = req.query;
  const key = `knowledge-base/user_${userid}/${collection}/${fileName}`;

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    res.json({ downloadUrl: url });
  } catch (error) {
    console.error('S3 Download Error:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
};
