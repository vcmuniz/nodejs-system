import prisma from '../prisma';
import { PrismaMessagingGroupRepository } from '../repositories/PrismaMessagingGroupRepository';

export const makeMessagingGroupRepository = (): PrismaMessagingGroupRepository => {
  return new PrismaMessagingGroupRepository(prisma);
};
