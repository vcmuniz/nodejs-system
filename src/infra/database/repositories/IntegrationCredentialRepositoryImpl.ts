import { PrismaClient } from '@prisma/client';
import { IIntegrationCredentialRepository } from '../../../ports/IIntegrationCredentialRepository';
import { IntegrationCredential, CreateIntegrationCredentialDTO, UpdateIntegrationCredentialDTO } from '../../../domain/models/IntegrationCredential';

export class IntegrationCredentialRepositoryImpl implements IIntegrationCredentialRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateIntegrationCredentialDTO): Promise<IntegrationCredential> {
    const result = await this.prisma.integrationCredential.create({
      data: {
        name: data.name,
        type: data.type,
        credentials: data.credentials,
        isActive: data.isActive ?? true,
        description: data.description,
      },
    });
    
    return this.mapToModel(result);
  }

  async findById(id: string): Promise<IntegrationCredential | null> {
    const result = await this.prisma.integrationCredential.findUnique({
      where: { id },
    });
    
    return result ? this.mapToModel(result) : null;
  }

  async findByName(name: string): Promise<IntegrationCredential | null> {
    const result = await this.prisma.integrationCredential.findUnique({
      where: { name },
    });
    
    return result ? this.mapToModel(result) : null;
  }

  async findByType(type: string, activeOnly: boolean = false): Promise<IntegrationCredential[]> {
    const results = await this.prisma.integrationCredential.findMany({
      where: {
        type,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return results.map(r => this.mapToModel(r));
  }

  async findAll(activeOnly: boolean = false): Promise<IntegrationCredential[]> {
    const results = await this.prisma.integrationCredential.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    
    return results.map(r => this.mapToModel(r));
  }

  async update(id: string, data: UpdateIntegrationCredentialDTO): Promise<IntegrationCredential> {
    const result = await this.prisma.integrationCredential.update({
      where: { id },
      data,
    });
    
    return this.mapToModel(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.integrationCredential.delete({
      where: { id },
    });
  }

  private mapToModel(data: any): IntegrationCredential {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      credentials: data.credentials as Record<string, any>,
      isActive: data.isActive,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
