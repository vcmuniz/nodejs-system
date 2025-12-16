// Factory para criar Messaging Repository
import prisma from '../prisma';
import { PrismaMessagingRepository } from '../repositories/PrismaMessagingRepository';
import { IMessagingRepository } from '../../../ports/IMessagingRepository';

export function makeMessagingRepository(): IMessagingRepository {
  return new PrismaMessagingRepository(prisma);
}
