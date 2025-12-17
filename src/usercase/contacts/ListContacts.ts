import { IUseCase } from "../IUseCase";
import { Contact } from "../../domain/models/Contact";
import { IContactRepository, ContactFilters } from "../../domain/repositories/IContactRepository";

export interface ListContactsInput {
  userId: string;
  businessProfileId: string;
  filters?: ContactFilters;
}

export interface ListContactsOutput {
  contacts: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ListContacts implements IUseCase<ListContactsInput, ListContactsOutput> {
  constructor(private contactRepository: IContactRepository) {}

  async execute(input: ListContactsInput): Promise<ListContactsOutput> {
    const page = input.filters?.page || 1;
    const limit = input.filters?.limit || 20;

    // Garantir que businessProfileId está nos filtros
    const filters = {
      ...input.filters,
      businessProfileId: input.businessProfileId
    };

    const contacts = await this.contactRepository.findByUserId(input.userId, filters);
    const total = await this.contactRepository.count(input.userId, filters);
    const totalPages = Math.ceil(total / limit);

    return {
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }
}
