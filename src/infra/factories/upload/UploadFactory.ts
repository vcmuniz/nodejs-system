import { PrismaClient } from '@prisma/client';
import { UploadFileUseCase } from '../../../usercase/upload/UploadFileUseCase';
import { PrismaUploadRepository } from '../../database/repositories/PrismaUploadRepository';
import { LocalFileStorageService } from '../../storage/LocalFileStorageService';

export class UploadFactory {
  private static prisma: PrismaClient;

  static initialize(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  static createUploadFileUseCase(): UploadFileUseCase {
    const storageService = new LocalFileStorageService();
    const uploadRepository = new PrismaUploadRepository(this.prisma, storageService);
    return new UploadFileUseCase(uploadRepository);
  }
}
