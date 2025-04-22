import axios from 'axios';

export const transformUploadedFiles = async (files: Express.Multer.File[]) => {
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

  const transformedData = uploadRes.data.map((item: any) => ({
    name: item.name,
    mime: item.mimeType,
    data: item.content,
    type: 'file:full',
  }));

  return transformedData;
};
