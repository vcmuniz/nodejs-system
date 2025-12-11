// Middleware de autenticação JWT
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';

interface TokenProvider {
  verify(token: string): any;
}

interface UserFetcher {
  fetchById(userId: string): Promise<any>;
}

export class AuthMiddleware {
  constructor(
    private tokenProvider: TokenProvider,
    private userFetcher: UserFetcher,
  ) {}

  handle = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Extrair token do header Authorization
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        res.status(401).json({ error: 'Token não fornecido' });
        return;
      }

      // Verificar e decodificar token
      const decoded = this.tokenProvider.verify(token);

      if (!decoded || !decoded.id) {
        res.status(401).json({ error: 'Token inválido' });
        return;
      }

      // Populiar usuário no request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      };

      next();
    } catch (error) {
      console.error('Erro na autenticação:', error);
      res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  };
}
