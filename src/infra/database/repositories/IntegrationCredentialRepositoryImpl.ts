import { PrismaClient } from '@prisma/client';
import { IIntegrationCredentialRepository } from '../../../ports/IIntegrationCredentialRepository';
import { IntegrationCredential, CreateIntegrationCredentialDTO, UpdateIntegrationCredentialDTO } from '../../../domain/models/IntegrationCredential';

export class IntegrationCredentialRepositoryImpl implements IIntegrationCredentialRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateIntegrationCredentialDTO): Promise<IntegrationCredential> {
    const result = await this.prisma.integration_credentials.create({
      data: {
        id: Math.random().toString(36).substring(7),
        name: data.name,
        type: data.type,
        credentials: JSON.stringify(data.credentials),
        isActive: data.isActive ?? true,
        description: data.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    return this.mapToModel(result);
  }

  async findById(id: string): Promise<IntegrationCredential | null> {
    const result = await this.prisma.integration_credentials.findUnique({
      where: { id },
    });
    
    return result ? this.mapToModel(result) : null;
  }

  async findByName(name: string): Promise<IntegrationCredential | null> {
    const result = await this.prisma.integration_credentials.findUnique({
      where: { name },
    });
    
    return result ? this.mapToModel(result) : null;
  }

  async findByType(type: string, activeOnly: boolean = false): Promise<IntegrationCredential[]> {
    const results = await this.prisma.integration_credentials.findMany({
      where: {
        type,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return results.map(r => this.mapToModel(r));
  }

  async findAll(activeOnly: boolean = false): Promise<IntegrationCredential[]> {
    const results = await this.prisma.integration_credentials.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    
    return results.map(r => this.mapToModel(r));
  }

  async update(id: string, data: UpdateIntegrationCredentialDTO): Promise<IntegrationCredential> {
    const updateData: any = { updatedAt: new Date() };
    
    if (data.name) updateData.name = data.name;
    if (data.credentials) updateData.credentials = JSON.stringify(data.credentials);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.description !== undefined) updateData.description = data.description;
    
    const result = await this.prisma.integration_credentials.update({
      where: { id },
      data: updateData,
    });
    
    return this.mapToModel(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.integration_credentials.delete({
      where: { id },
    });
  }

  private mapToModel(data: any): IntegrationCredential {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      credentials: JSON.parse(data.credentials as string),
      isActive: data.isActive,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
