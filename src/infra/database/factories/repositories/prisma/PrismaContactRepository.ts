import { PrismaClient } from "@prisma/client";
import { Contact } from "../../../../../domain/models/Contact";
import { IContactRepository, ContactFilters } from "../../../../../domain/repositories/IContactRepository";

export class PrismaContactRepository implements IContactRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Contact | null> {
    const data = await this.prisma.contacts.findUnique({
      where: { id },
      include: {
        leadCapture: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!data) return null;
    return this.toDomain(data);
  }

  async findByUserId(userId: string, filters?: ContactFilters): Promise<Contact[]> {
    const where: any = { userId };

    // MULTI-TENANT: Filtrar por businessProfileId se fornecido
    if (filters?.businessProfileId) {
      where.businessProfileId = filters.businessProfileId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.isLead !== undefined) {
      where.isLead = filters.isLead;
    }

    if (filters?.leadCaptureId) {
      where.leadCaptureId = filters.leadCaptureId;
    }

    if (filters?.source) {
      where.source = filters.source;
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        contains: filters.tags[0]
      };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } },
        { phone: { contains: filters.search } },
        { company: { contains: filters.search } }
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const data = await this.prisma.contacts.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        leadCapture: true
      }
    });

    return data.map(item => this.toDomain(item));
  }

  async findByEmail(email: string, userId: string): Promise<Contact | null> {
    const data = await this.prisma.contacts.findFirst({
      where: { email, userId }
    });

    if (!data) return null;
    return this.toDomain(data);
  }

  async findByCpf(cpf: string): Promise<Contact | null> {
    const data = await this.prisma.contacts.findUnique({
      where: { cpf }
    });

    if (!data) return null;
    return this.toDomain(data);
  }

  async findLeadsByUserId(userId: string, filters?: ContactFilters): Promise<Contact[]> {
    return this.findByUserId(userId, { ...filters, isLead: true });
  }

  async save(contact: Contact): Promise<Contact> {
    const data = await this.prisma.contacts.create({
      data: {
        id: contact.id,
        userId: contact.userId,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        cpf: contact.cpf,
        company: contact.company,
        position: contact.position,
        website: contact.website,
        street: contact.street,
        number: contact.number,
        complement: contact.complement,
        neighborhood: contact.neighborhood,
        city: contact.city,
        state: contact.state,
        zipCode: contact.zipCode,
        country: contact.country,
        birthDate: contact.birthDate,
        notes: contact.notes,
        tags: contact.tags ? JSON.stringify(contact.tags) : null,
        customFields: contact.customFields ? JSON.stringify(contact.customFields) : null,
        source: contact.source,
        sourceUrl: contact.sourceUrl,
        leadCaptureId: contact.leadCaptureId,
        status: contact.status,
        isLead: contact.isLead,
        leadScore: contact.leadScore,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
        convertedAt: contact.convertedAt
      }
    });

    return this.toDomain(data);
  }

  async update(contact: Contact): Promise<Contact> {
    const data = await this.prisma.contacts.update({
      where: { id: contact.id },
      data: {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        cpf: contact.cpf,
        company: contact.company,
        position: contact.position,
        website: contact.website,
        street: contact.street,
        number: contact.number,
        complement: contact.complement,
        neighborhood: contact.neighborhood,
        city: contact.city,
        state: contact.state,
        zipCode: contact.zipCode,
        country: contact.country,
        birthDate: contact.birthDate,
        notes: contact.notes,
        tags: contact.tags ? JSON.stringify(contact.tags) : null,
        customFields: contact.customFields ? JSON.stringify(contact.customFields) : null,
        source: contact.source,
        sourceUrl: contact.sourceUrl,
        leadCaptureId: contact.leadCaptureId,
        status: contact.status,
        isLead: contact.isLead,
        leadScore: contact.leadScore,
        updatedAt: new Date(),
        convertedAt: contact.convertedAt
      }
    });

    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contacts.delete({
      where: { id }
    });
  }

  async count(userId: string, filters?: ContactFilters): Promise<number> {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.isLead !== undefined) {
      where.isLead = filters.isLead;
    }

    if (filters?.leadCaptureId) {
      where.leadCaptureId = filters.leadCaptureId;
    }

    return this.prisma.contacts.count({ where });
  }

  private toDomain(data: any): Contact {
    return new Contact(
      data.id,
      data.userId,
      data.name,
      data.email,
      data.phone,
      data.cpf,
      data.company,
      data.position,
      data.website,
      data.street,
      data.number,
      data.complement,
      data.neighborhood,
      data.city,
      data.state,
      data.zipCode,
      data.country,
      data.birthDate,
      data.notes,
      data.tags ? JSON.parse(data.tags) : null,
      data.customFields ? JSON.parse(data.customFields) : null,
      data.source,
      data.sourceUrl,
      data.leadCaptureId,
      data.status,
      data.isLead,
      data.leadScore,
      data.createdAt,
      data.updatedAt,
      data.convertedAt
    );
  }
}
