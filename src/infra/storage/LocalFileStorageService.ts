import { IFileStorageService } from '../../ports/upload/IFileStorageService';
import { ENV } from '../../config/enviroments';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class LocalFileStorageService implements IFileStorageService {
  private baseDir: string;
  private baseUrl: string;

  constructor(baseDir: string = './uploads', baseUrl?: string) {
    this.baseDir = baseDir;
    this.baseUrl = baseUrl || ENV.APP_DOMAIN;
  }

  async saveFile(file: Express.Multer.File, subPath: string = ''): Promise<{ path: string; url: string }> {
    const uploadDir = path.join(this.baseDir, subPath);
    
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(subPath, filename);
    const fullPath = path.join(this.baseDir, filePath);

    await fs.writeFile(fullPath, file.buffer);

    const url = `${this.baseUrl}/uploads/${filePath.replace(/\\/g, '/')}`;

    return { path: filePath, url };
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
    }
  }

  getFileUrl(filePath: string): string {
    return `${this.baseUrl}/uploads/${filePath.replace(/\\/g, '/')}`;
  }
}
