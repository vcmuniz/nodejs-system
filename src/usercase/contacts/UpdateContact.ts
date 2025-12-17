import { IUseCase } from "../IUseCase";
import { Contact } from "../../domain/models/Contact";
import { IContactRepository } from "../../domain/repositories/IContactRepository";

export interface UpdateContactInput {
  id: string;
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  company?: string;
  position?: string;
  website?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  notes?: string;
  status?: string;
}

export interface UpdateContactOutput {
  contact: Contact;
}

export class UpdateContact implements IUseCase<UpdateContactInput, UpdateContactOutput> {
  constructor(private contactRepository: IContactRepository) {}

  async execute(input: UpdateContactInput): Promise<UpdateContactOutput> {
    const contact = await this.contactRepository.findById(input.id);

    if (!contact) {
      throw new Error('Contato não encontrado');
    }

    if (contact.userId !== input.userId) {
      throw new Error('Acesso negado');
    }

    if (input.name) contact.name = input.name;
    if (input.email !== undefined) contact.email = input.email;
    if (input.phone !== undefined) contact.phone = input.phone;
    if (input.cpf !== undefined) contact.cpf = input.cpf;
    if (input.company !== undefined) contact.company = input.company;
    if (input.position !== undefined) contact.position = input.position;
    if (input.website !== undefined) contact.website = input.website;
    if (input.street !== undefined) contact.street = input.street;
    if (input.number !== undefined) contact.number = input.number;
    if (input.complement !== undefined) contact.complement = input.complement;
    if (input.neighborhood !== undefined) contact.neighborhood = input.neighborhood;
    if (input.city !== undefined) contact.city = input.city;
    if (input.state !== undefined) contact.state = input.state;
    if (input.zipCode !== undefined) contact.zipCode = input.zipCode;
    if (input.country !== undefined) contact.country = input.country;
    if (input.tags !== undefined) contact.tags = input.tags;
    if (input.customFields !== undefined) contact.customFields = input.customFields;
    if (input.notes !== undefined) contact.notes = input.notes;
    if (input.status) contact.status = input.status;

    contact.calculateLeadScore();

    const updatedContact = await this.contactRepository.update(contact);

    return { contact: updatedContact };
  }
}
