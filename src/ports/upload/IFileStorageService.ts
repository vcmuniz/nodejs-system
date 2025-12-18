export interface IFileStorageService {
  saveFile(file: Express.Multer.File, subPath?: string): Promise<{ path: string; url: string }>;
  deleteFile(path: string): Promise<void>;
  getFileUrl(path: string): string;
}
