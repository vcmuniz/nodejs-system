import { PrismaClient } from "@prisma/client";
import { LeadCapture } from "../../../../../domain/models/LeadCapture";
import { ILeadCaptureRepository } from "../../../../../domain/repositories/ILeadCaptureRepository";

export class PrismaLeadCaptureRepository implements ILeadCaptureRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<LeadCapture | null> {
    const data = await this.prisma.lead_captures.findUnique({
      where: { id }
    });

    if (!data) return null;
    return this.toDomain(data);
  }

  async findBySlug(slug: string): Promise<LeadCapture | null> {
    const data = await this.prisma.lead_captures.findUnique({
      where: { slug }
    });

    if (!data) return null;
    return this.toDomain(data);
  }

  async findByUserId(userId: string): Promise<LeadCapture[]> {
    const data = await this.prisma.lead_captures.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return data.map(item => this.toDomain(item));
  }

  async save(leadCapture: LeadCapture): Promise<LeadCapture> {
    const data = await this.prisma.lead_captures.create({
      data: {
        id: leadCapture.id,
        userId: leadCapture.userId,
        name: leadCapture.name,
        title: leadCapture.title,
        description: leadCapture.description,
        fields: JSON.stringify(leadCapture.fields),
        requiredFields: JSON.stringify(leadCapture.requiredFields),
        submitButtonText: leadCapture.submitButtonText,
        successMessage: leadCapture.successMessage,
        redirectUrl: leadCapture.redirectUrl,
        webhookUrl: leadCapture.webhookUrl,
        notifyEmail: leadCapture.notifyEmail,
        isActive: leadCapture.isActive,
        slug: leadCapture.slug,
        totalCaptures: leadCapture.totalCaptures,
        createdAt: leadCapture.createdAt,
        updatedAt: leadCapture.updatedAt
      }
    });

    return this.toDomain(data);
  }

  async update(leadCapture: LeadCapture): Promise<LeadCapture> {
    const data = await this.prisma.lead_captures.update({
      where: { id: leadCapture.id },
      data: {
        name: leadCapture.name,
        title: leadCapture.title,
        description: leadCapture.description,
        fields: JSON.stringify(leadCapture.fields),
        requiredFields: JSON.stringify(leadCapture.requiredFields),
        submitButtonText: leadCapture.submitButtonText,
        successMessage: leadCapture.successMessage,
        redirectUrl: leadCapture.redirectUrl,
        webhookUrl: leadCapture.webhookUrl,
        notifyEmail: leadCapture.notifyEmail,
        isActive: leadCapture.isActive,
        slug: leadCapture.slug,
        updatedAt: new Date()
      }
    });

    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lead_captures.delete({
      where: { id }
    });
  }

  async incrementCaptures(id: string): Promise<void> {
    await this.prisma.lead_captures.update({
      where: { id },
      data: {
        totalCaptures: { increment: 1 },
        updatedAt: new Date()
      }
    });
  }

  private toDomain(data: any): LeadCapture {
    return new LeadCapture(
      data.id,
      data.userId,
      data.name,
      data.title,
      data.description,
      JSON.parse(data.fields),
      JSON.parse(data.requiredFields),
      data.submitButtonText,
      data.successMessage,
      data.redirectUrl,
      data.webhookUrl,
      data.notifyEmail,
      data.isActive,
      data.slug,
      data.totalCaptures,
      data.createdAt,
      data.updatedAt
    );
  }
}
