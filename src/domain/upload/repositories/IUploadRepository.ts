import { UploadedFile } from '../entities/UploadedFile';

export interface IUploadRepository {
  saveFile(file: Express.Multer.File, userId: string, businessProfileId: string): Promise<UploadedFile>;
  getFileById(id: string): Promise<UploadedFile | null>;
  deleteFile(id: string): Promise<void>;
}
