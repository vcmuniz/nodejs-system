import { Contact } from "../models/Contact";

export interface IContactRepository {
  findById(id: string): Promise<Contact | null>;
  findByUserId(userId: string, filters?: ContactFilters): Promise<Contact[]>;
  findByEmail(email: string, userId: string): Promise<Contact | null>;
  findByCpf(cpf: string): Promise<Contact | null>;
  findLeadsByUserId(userId: string, filters?: ContactFilters): Promise<Contact[]>;
  save(contact: Contact): Promise<Contact>;
  update(contact: Contact): Promise<Contact>;
  delete(id: string): Promise<void>;
  count(userId: string, filters?: ContactFilters): Promise<number>;
}

export interface ContactFilters {
  status?: string;
  isLead?: boolean;
  leadCaptureId?: string;
  tags?: string[];
  source?: string;
  search?: string;
  page?: number;
  limit?: number;
}
