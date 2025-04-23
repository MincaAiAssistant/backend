import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const transformUploadedFiles = async (
  files: Express.Multer.File[],
  returnMetaOnly: boolean = false // toggle if you want metadata only
) => {
  const FormData = (await import('form-data')).default;
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
  });

  const uploadRes = await axios.post(
    `${process.env.ATTACHMENT_API}`,
    formData,
    {
      headers: {
        ...formData.getHeaders(),
      },
    }
  );

  // Assume uploadRes.data returns something like:
  // [{ name, mimeType, content, id, size }, ...]

  const transformedData = uploadRes.data.map((item: any) => {
    if (returnMetaOnly) {
      return {
        name: item.name,
        mime: item.mimeType,
        size: item.size,
        id: 'file_' + uuidv4(),
        type: 'file:meta',
      };
    } else {
      return {
        name: item.name,
        mime: item.mimeType,
        data: item.content,
        type: 'file:full',
      };
    }
  });

  return transformedData;
};
