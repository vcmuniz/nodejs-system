import { ContactActivity } from "../models/ContactActivity";

export interface IContactActivityRepository {
  findById(id: string): Promise<ContactActivity | null>;
  findByContactId(contactId: string, limit?: number): Promise<ContactActivity[]>;
  save(activity: ContactActivity): Promise<ContactActivity>;
  delete(id: string): Promise<void>;
}
