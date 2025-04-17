import express from 'express';
import dotenv from 'dotenv';
import { uploadFilesHandler } from '../controllers/fileUploader/uploadFiles';
import { uploadFilesMiddleware } from '../middleware/multerMiddleware';
import { getAllFiles } from '../controllers/fileUploader/getAllFiles';
import { DeleteFilesHandler } from '../controllers/fileUploader/deleteFiles';
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
routerUpload.delete('/files/:fileName', authenticateToken, DeleteFilesHandler);

export default routerUpload;
