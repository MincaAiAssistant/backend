import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadFilesMiddleware = upload.array('files');
