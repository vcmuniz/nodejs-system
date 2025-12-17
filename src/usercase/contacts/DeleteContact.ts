import { IUseCase } from "../IUseCase";
import { IContactRepository } from "../../domain/repositories/IContactRepository";

export interface DeleteContactInput {
  id: string;
  userId: string;
}

export interface DeleteContactOutput {
  success: boolean;
}

export class DeleteContact implements IUseCase<DeleteContactInput, DeleteContactOutput> {
  constructor(private contactRepository: IContactRepository) {}

  async execute(input: DeleteContactInput): Promise<DeleteContactOutput> {
    const contact = await this.contactRepository.findById(input.id);

    if (!contact) {
      throw new Error('Contato não encontrado');
    }

    if (contact.userId !== input.userId) {
      throw new Error('Acesso negado');
    }

    await this.contactRepository.delete(input.id);

    return { success: true };
  }
}
