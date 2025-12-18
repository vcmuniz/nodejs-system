import { Request, Response } from 'express';
import { UploadFileUseCase } from '../../usercase/upload/UploadFileUseCase';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';

export class UploadController {
  constructor(private uploadFileUseCase: UploadFileUseCase) {}

  async upload(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
        return;
      }

      const userId = req.user?.id;
      const businessProfileId = req.user?.businessProfileId;

      if (!userId || !businessProfileId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const uploadedFile = await this.uploadFileUseCase.execute(
        req.file,
        userId,
        businessProfileId
      );

      res.status(200).json({
        success: true,
        file: {
          id: uploadedFile.id,
          filename: uploadedFile.filename,
          originalName: uploadedFile.originalName,
          mimeType: uploadedFile.mimeType,
          size: uploadedFile.size,
          url: uploadedFile.url,
        },
      });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      res.status(500).json({ error: error.message || 'Erro ao fazer upload do arquivo' });
    }
  }
}
