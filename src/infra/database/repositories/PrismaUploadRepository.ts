import { PrismaClient } from '@prisma/client';
import { IUploadRepository } from '../../../domain/upload/repositories/IUploadRepository';
import { UploadedFile } from '../../../domain/upload/entities/UploadedFile';
import { IFileStorageService } from '../../../ports/upload/IFileStorageService';
import { v4 as uuidv4 } from 'uuid';

export class PrismaUploadRepository implements IUploadRepository {
  constructor(
    private prisma: PrismaClient,
    private storageService: IFileStorageService
  ) {}

  async saveFile(
    file: Express.Multer.File,
    userId: string,
    businessProfileId: string
  ): Promise<UploadedFile> {
    const { path, url } = await this.storageService.saveFile(file, businessProfileId);

    const uploadedFile = await this.prisma.uploaded_files.create({
      data: {
        id: uuidv4(),
        filename: path.split('/').pop() || '',
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
        path,
        userId,
        businessProfileId,
      },
    });

    return {
      id: uploadedFile.id,
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalName,
      mimeType: uploadedFile.mimeType,
      size: uploadedFile.size,
      url: uploadedFile.url,
      path: uploadedFile.path,
      userId: uploadedFile.userId,
      businessProfileId: uploadedFile.businessProfileId,
      createdAt: uploadedFile.createdAt,
    };
  }

  async getFileById(id: string): Promise<UploadedFile | null> {
    const file = await this.prisma.uploaded_files.findUnique({
      where: { id },
    });

    if (!file) return null;

    return {
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      url: file.url,
      path: file.path,
      userId: file.userId,
      businessProfileId: file.businessProfileId,
      createdAt: file.createdAt,
    };
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.prisma.uploaded_files.findUnique({
      where: { id },
    });

    if (file) {
      await this.storageService.deleteFile(file.path);
      await this.prisma.uploaded_files.delete({
        where: { id },
      });
    }
  }
}
