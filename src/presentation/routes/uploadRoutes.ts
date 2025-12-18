import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/UploadController';
import { UploadFactory } from '../../infra/factories/upload/UploadFactory';
import { makeAuthMiddleware } from '../factories/middlewares/makeAuthMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const authMiddleware = makeAuthMiddleware();

const uploadFileUseCase = UploadFactory.createUploadFileUseCase();
const uploadController = new UploadController(uploadFileUseCase);

/**
 * @swagger
 * /api/upload:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload de arquivo
 *     description: Faz upload de um arquivo e retorna a URL pública
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo para upload (máx 50MB)
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 file:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     filename:
 *                       type: string
 *                       example: "123e4567-e89b-12d3-a456-426614174000.jpg"
 *                     originalName:
 *                       type: string
 *                       example: "foto.jpg"
 *                     mimeType:
 *                       type: string
 *                       example: "image/jpeg"
 *                     size:
 *                       type: number
 *                       example: 245678
 *                     url:
 *                       type: string
 *                       example: "http://localhost:3000/uploads/business_123/123e4567-e89b-12d3-a456-426614174000.jpg"
 *       400:
 *         description: Nenhum arquivo enviado
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro no servidor
 */
router.post('/', authMiddleware.authenticate(), upload.single('file'), (req, res) =>
  uploadController.upload(req, res)
);

export default router;
