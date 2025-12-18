export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
  userId: string;
  businessProfileId: string;
  createdAt: Date;
}
