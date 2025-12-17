import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../presentation/interfaces/AuthenticatedRequest';

/**
 * Middleware que garante que o usuário NÃO tenha businessProfileId no token.
 * Usado para rotas que DEVEM ser acessadas antes de selecionar uma organização.
 * 
 * Exemplo: Listar organizações disponíveis.
 */
export const requireNoBusinessProfile = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const businessProfileId = req.user?.businessProfileId;

  if (businessProfileId) {
    return res.status(400).json({
      success: false,
      error: 'Business profile already selected',
      message: 'Você já tem uma organização selecionada. Use /api/business-profiles/switch para trocar.',
      action: 'USE_SWITCH_ENDPOINT'
    });
  }

  next();
};
