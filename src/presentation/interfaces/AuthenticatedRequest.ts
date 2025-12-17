// Interface customizada para Request com usuário autenticado
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
    businessProfileId?: string;
  };
}
