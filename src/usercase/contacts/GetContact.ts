import { IUseCase } from "../IUseCase";
import { Contact } from "../../domain/models/Contact";
import { IContactRepository } from "../../domain/repositories/IContactRepository";

export interface GetContactInput {
  id: string;
  userId: string;
}

export interface GetContactOutput {
  contact: Contact;
}

export class GetContact implements IUseCase<GetContactInput, GetContactOutput> {
  constructor(private contactRepository: IContactRepository) {}

  async execute(input: GetContactInput): Promise<GetContactOutput> {
    const contact = await this.contactRepository.findById(input.id);

    if (!contact) {
      throw new Error('Contato não encontrado');
    }

    if (contact.userId !== input.userId) {
      throw new Error('Acesso negado');
    }

    return { contact };
  }
}
