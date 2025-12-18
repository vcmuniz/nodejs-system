import { IUploadRepository } from '../../domain/upload/repositories/IUploadRepository';
import { UploadedFile } from '../../domain/upload/entities/UploadedFile';

export class UploadFileUseCase {
  constructor(private uploadRepository: IUploadRepository) {}

  async execute(
    file: Express.Multer.File,
    userId: string,
    businessProfileId: string
  ): Promise<UploadedFile> {
    if (!file) {
      throw new Error('Nenhum arquivo foi enviado');
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Máximo: 50MB');
    }

    return await this.uploadRepository.saveFile(file, userId, businessProfileId);
  }
}
