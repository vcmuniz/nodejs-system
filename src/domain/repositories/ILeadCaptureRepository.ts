import { LeadCapture } from "../models/LeadCapture";

export interface ILeadCaptureRepository {
  findById(id: string): Promise<LeadCapture | null>;
  findBySlug(slug: string): Promise<LeadCapture | null>;
  findByUserId(userId: string, businessProfileId?: string): Promise<LeadCapture[]>;
  save(leadCapture: LeadCapture): Promise<LeadCapture>;
  update(leadCapture: LeadCapture): Promise<LeadCapture>;
  delete(id: string): Promise<void>;
  incrementCaptures(id: string): Promise<void>;
}
