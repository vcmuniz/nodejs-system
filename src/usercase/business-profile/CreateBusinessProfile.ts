import { PrismaClient } from '@prisma/client';
import { ITokenProvider } from '../../domain/providers/ITokenProvider';

export interface CreateBusinessProfileInput {
  userId: string;
  email: string;
  name?: string;
  role?: string;
  companyName: string;
  tradingName?: string;
  cnpj?: string;
  whatsapp?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  description?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
}

export interface CreateBusinessProfileOutput {
  token: string;
  businessProfile: {
    id: string;
    companyName: string | null;
    tradingName: string | null;
    cnpj: string | null;
  };
}

export class CreateBusinessProfile {
  constructor(
    private prisma: PrismaClient,
    private tokenProvider: ITokenProvider
  ) {}

  async execute(input: CreateBusinessProfileInput): Promise<CreateBusinessProfileOutput> {
    // Validar se CNPJ já existe (se fornecido)
    if (input.cnpj) {
      const existingBusiness = await this.prisma.business_profiles.findFirst({
        where: { cnpj: input.cnpj }
      });

      if (existingBusiness) {
        throw new Error('CNPJ already registered');
      }
    }

    // Gerar ID único
    const businessId = `business_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Criar nova organização
    const businessProfile = await this.prisma.business_profiles.create({
      data: {
        id: businessId,
        userId: input.userId,
        companyName: input.companyName,
        tradingName: input.tradingName || null,
        cnpj: input.cnpj || null,
        whatsapp: input.whatsapp || null,
        cep: input.cep || null,
        street: input.street || null,
        number: input.number || null,
        complement: input.complement || null,
        neighborhood: input.neighborhood || null,
        city: input.city || null,
        state: input.state || null,
        description: input.description || null,
        instagram: input.instagram || null,
        facebook: input.facebook || null,
        website: input.website || null,
        updatedAt: new Date(),
      }
    });

    // Gerar novo token com businessProfileId
    const token = await this.tokenProvider.generateToken({
      userId: input.userId,
      email: input.email,
      name: input.name,
      role: input.role,
      businessProfileId: businessProfile.id
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
