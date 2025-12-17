import { PrismaClient } from '@prisma/client';

export interface ListUserBusinessProfilesInput {
  userId: string;
}

export interface BusinessProfileOutput {
  id: string;
  companyName: string | null;
  tradingName: string | null;
  cnpj: string | null;
  cpf: string | null;
  personType: string;
  status: string;
  companyLogo: string | null;
}

export class ListUserBusinessProfiles {
  constructor(private prisma: PrismaClient) {}

  async execute(input: ListUserBusinessProfilesInput): Promise<{ businessProfiles: BusinessProfileOutput[] }> {
    const profiles = await this.prisma.business_profiles.findMany({
      where: {
        userId: input.userId
      },
      select: {
        id: true,
        companyName: true,
        tradingName: true,
        cnpj: true,
        cpf: true,
        personType: true,
        status: true,
        companyLogo: true
      }
    });

    return {
      businessProfiles: profiles
    };
  }
}
