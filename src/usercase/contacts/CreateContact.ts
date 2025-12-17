import { IUseCase } from "../IUseCase";
import { Contact } from "../../domain/models/Contact";
import { IContactRepository } from "../../domain/repositories/IContactRepository";
import { IContactActivityRepository } from "../../domain/repositories/IContactActivityRepository";
import { ContactActivity } from "../../domain/models/ContactActivity";

export interface CreateContactInput {
  userId: string;
  businessProfileId: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  company?: string;
  position?: string;
  website?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  notes?: string;
  source?: string;
  isLead?: boolean;
}

export interface CreateContactOutput {
  contact: Contact;
}

export class CreateContact implements IUseCase<CreateContactInput, CreateContactOutput> {
  constructor(
    private contactRepository: IContactRepository,
    private activityRepository: IContactActivityRepository
  ) {}

  async execute(input: CreateContactInput): Promise<CreateContactOutput> {
    if (!input.email && !input.phone) {
      throw new Error('Email ou telefone é obrigatório');
    }

    if (input.email) {
      const existing = await this.contactRepository.findByEmail(input.email, input.userId);
      if (existing) {
        throw new Error('Já existe um contato com este email');
      }
    }

    if (input.cpf) {
      const existing = await this.contactRepository.findByCpf(input.cpf);
      if (existing) {
        throw new Error('Já existe um contato com este CPF');
      }
    }

    const contact = Contact.create({
      userId: input.userId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      cpf: input.cpf,
      company: input.company,
      position: input.position,
      tags: input.tags,
      customFields: input.customFields,
      source: input.source || 'manual',
      isLead: input.isLead || false
    });

    if (input.notes) {
      contact.notes = input.notes;
    }

    contact.calculateLeadScore();

    const savedContact = await this.contactRepository.save(contact);

    const activity = ContactActivity.create({
      contactId: savedContact.id,
      userId: input.userId,
      type: input.isLead ? 'lead_captured' : 'note',
      title: input.isLead ? 'Lead criado' : 'Contato criado',
      description: input.isLead ? 'Lead criado manualmente' : 'Contato criado manualmente'
    });

    await this.activityRepository.save(activity);

    return { contact: savedContact };
  }
}
