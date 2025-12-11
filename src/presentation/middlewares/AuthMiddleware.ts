// Middleware de autenticação - segue padrão do projeto
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // Extrair token do header Authorization
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    // TODO: Implementar JWT validation aqui
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;

    // Para agora, apenas marca como autenticado
    // Em produção, decodificar o JWT e popular req.user
    req.user = {
      id: 'placeholder-user-id',
      email: 'user@example.com',
      name: 'User Name',
      role: 'USER',
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};
