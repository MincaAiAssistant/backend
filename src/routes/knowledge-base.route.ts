import express from 'express';
import dotenv from 'dotenv';
import { uploadFilesHandler } from '../controllers/knowledge-base/uploadFiles';
import { uploadFilesMiddleware } from '../middleware/multerMiddleware';
import { getAllFiles } from '../controllers/knowledge-base/getAllFiles';
import { DeleteFilesHandler } from '../controllers/knowledge-base/deleteFiles';
import { authenticateToken } from '../middleware/authMiddleware';
import { DownloadFilesHandler } from '../controllers/knowledge-base/downloadFiles';
import { renameFilesHandler } from '../controllers/knowledge-base/renameFiles';

dotenv.config();

const routerUpload = express.Router();

routerUpload.post(
  '/collection/:collection/files',
  uploadFilesMiddleware,
  authenticateToken,
  uploadFilesHandler
);
routerUpload.post('/files/rename', authenticateToken, renameFilesHandler);
routerUpload.get('/files', authenticateToken, getAllFiles);
routerUpload.delete(
  '/collection/:collection/files/:fileName',
  authenticateToken,
  DeleteFilesHandler
);
routerUpload.get(
  '/collection/:collection/files/:fileName/download',
  authenticateToken,
  DownloadFilesHandler
);

export default routerUpload;
