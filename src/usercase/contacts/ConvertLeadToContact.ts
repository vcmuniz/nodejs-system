import { IUseCase } from "../IUseCase";
import { Contact } from "../../domain/models/Contact";
import { IContactRepository } from "../../domain/repositories/IContactRepository";
import { IContactActivityRepository } from "../../domain/repositories/IContactActivityRepository";
import { ContactActivity } from "../../domain/models/ContactActivity";

export interface ConvertLeadToContactInput {
  id: string;
  userId: string;
  notes?: string;
}

export interface ConvertLeadToContactOutput {
  contact: Contact;
}

export class ConvertLeadToContact implements IUseCase<ConvertLeadToContactInput, ConvertLeadToContactOutput> {
  constructor(
    private contactRepository: IContactRepository,
    private activityRepository: IContactActivityRepository
  ) {}

  async execute(input: ConvertLeadToContactInput): Promise<ConvertLeadToContactOutput> {
    const contact = await this.contactRepository.findById(input.id);

    if (!contact) {
      throw new Error('Lead não encontrado');
    }

    if (contact.userId !== input.userId) {
      throw new Error('Acesso negado');
    }

    if (!contact.isLead) {
      throw new Error('Este contato já não é mais um lead');
    }

    contact.convertToContact(input.notes);

    const updatedContact = await this.contactRepository.update(contact);

    const activity = ContactActivity.createConversionActivity(
      contact.id,
      input.userId,
      input.notes
    );

    await this.activityRepository.save(activity);

    return { contact: updatedContact };
  }
}
