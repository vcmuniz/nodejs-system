import prisma from '../../database/prisma';
import { IntegrationCredentialRepositoryImpl } from '../repositories/IntegrationCredentialRepositoryImpl';

export const makeIntegrationCredentialRepository = () => {
  return new IntegrationCredentialRepositoryImpl(prisma);
};
