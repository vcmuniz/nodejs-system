import { PrismaClient } from '@prisma/client';
import { ITokenProvider } from '../../domain/providers/ITokenProvider';

export interface SelectBusinessProfileInput {
  userId: string;
  businessProfileId: string;
  email: string;
  name?: string;
  role?: string;
}

export interface SelectBusinessProfileOutput {
  token: string;
  businessProfile: {
    id: string;
    companyName: string | null;
    tradingName: string | null;
    cnpj: string | null;
  };
}

export class SelectBusinessProfile {
  constructor(
    private prisma: PrismaClient,
    private tokenProvider: ITokenProvider
  ) {}

  async execute(input: SelectBusinessProfileInput): Promise<SelectBusinessProfileOutput> {
    // Validar se o business profile pertence ao usuário
    const businessProfile = await this.prisma.business_profiles.findFirst({
      where: {
        id: input.businessProfileId,
        userId: input.userId
      }
    });

    if (!businessProfile) {
      throw new Error('Business profile not found or access denied');
    }

    // Gerar novo token com businessProfileId
    const token = await this.tokenProvider.generateToken({
      userId: input.userId,
      email: input.email,
      name: input.name,
      role: input.role,
      businessProfileId: input.businessProfileId
    });

    return {
      token,
      businessProfile: {
        id: businessProfile.id,
        companyName: businessProfile.companyName,
        tradingName: businessProfile.tradingName,
        cnpj: businessProfile.cnpj
      }
    };
  }
}
