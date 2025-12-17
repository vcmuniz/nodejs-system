import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../presentation/interfaces/AuthenticatedRequest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const requireBusinessProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const businessProfileId = req.user?.businessProfileId;

  if (!businessProfileId) {
    return res.status(400).json({
      success: false,
      error: 'Business profile not selected',
      message: 'Por favor, selecione uma organização antes de continuar',
      action: 'SELECT_BUSINESS_PROFILE'
    });
  }

  // Opcional: Validar se o usuário ainda tem acesso à organização
  const userId = req.user?.id;
  if (userId) {
    const hasAccess = await prisma.business_profiles.findFirst({
      where: {
        id: businessProfileId,
        userId: userId
      }
    });

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Você não tem acesso a esta organização'
      });
    }
  }

  next();
};
