import { PrismaClient } from "@prisma/client";
import { ContactActivity } from "../../../../../domain/models/ContactActivity";
import { IContactActivityRepository } from "../../../../../domain/repositories/IContactActivityRepository";

export class PrismaContactActivityRepository implements IContactActivityRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<ContactActivity | null> {
    const data = await this.prisma.contact_activities.findUnique({
      where: { id }
    });

    if (!data) return null;
    return this.toDomain(data);
  }

  async findByContactId(contactId: string, limit: number = 50): Promise<ContactActivity[]> {
    const data = await this.prisma.contact_activities.findMany({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return data.map(item => this.toDomain(item));
  }

  async save(activity: ContactActivity): Promise<ContactActivity> {
    const data = await this.prisma.contact_activities.create({
      data: {
        id: activity.id,
        contactId: activity.contactId,
        userId: activity.userId,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        metadata: activity.metadata ? JSON.stringify(activity.metadata) : null,
        createdAt: activity.createdAt
      }
    });

    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contact_activities.delete({
      where: { id }
    });
  }

  private toDomain(data: any): ContactActivity {
    return new ContactActivity(
      data.id,
      data.contactId,
      data.userId,
      data.type,
      data.title,
      data.description,
      data.metadata ? JSON.parse(data.metadata) : null,
      data.createdAt
    );
  }
}
