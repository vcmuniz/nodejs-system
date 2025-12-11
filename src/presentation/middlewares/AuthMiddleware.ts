// Middleware de autenticação JWT
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';

export class AuthMiddleware {
  static handle(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      // Exemplo simples - em produção usar JWT properly
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        res.status(401).json({ error: 'Token não fornecido' });
        return;
      }

      // Aqui você decodificaria o JWT e popularia req.user
      // Exemplo com JWT:
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // req.user = decoded;

      // Para desenvolvimento, você pode adicionar o usuário diretamente:
      req.user = {
        id: 'user-from-token', // extraído do token
        email: 'user@example.com',
        name: 'User Name',
        role: 'USER',
      };

      next();
    } catch (error) {
      res.status(401).json({ error: 'Token inválido' });
    }
  }
}
