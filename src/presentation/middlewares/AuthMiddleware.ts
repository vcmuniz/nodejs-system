import { NextFunction, Request, Response } from "express";
import { IAuthenticationValidator } from "../../domain/auth/IAuthenticationValidator";
import { IUserFetcher } from "../../usercase/auth/CachedUserFetcher";
import ITokenProvider from "../../domain/providers/ITokenProvider";
import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";

export class AuthMiddleware {
  constructor(
    private readonly tokenGenerator: ITokenProvider,
    private readonly userFetcher: IUserFetcher
  ) { }

  authenticate() {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        console.log('[AuthMiddleware] 1. Iniciando autenticação');
        
        const token = this.extractToken(req);
        if (!token) {
          console.log('[AuthMiddleware] 2. Token não fornecido');
          return res.status(401).json({ error: "Token not provided" });
        }

        console.log('[AuthMiddleware] 3. Token extraído, decodificando...');
        const decoded = await this.tokenGenerator.decodeToken(token);
        if (!decoded) {
          console.log('[AuthMiddleware] 4. Token inválido');
          return res.status(401).json({ error: "Invalid token" });
        }

        console.log('[AuthMiddleware] 5. Token decodificado:', decoded);
        console.log('[AuthMiddleware] 6. Buscando usuário...');
        
        const user = await this.userFetcher.getUserById(decoded.userId);
        console.log('[AuthMiddleware] 7. Usuário encontrado:', user ? 'SIM' : 'NÃO');
        
        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }

        req.user = {
          id: decoded.userId,
          email: decoded.email,
          role: user.role,
        };

        console.log('[AuthMiddleware] 8. req.user definido, chamando next()');
        next();
      } catch (err) {
        console.error('[AuthMiddleware] ERRO:', err);
        return res.status(500).json({ error: "Authentication failed" });
      }
    };
  }

  requireAdmin() {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "User not authenticated" });
        }

        if (req.user.role !== 'ADMIN') {
          return res.status(403).json({ error: "Access denied. Admin role required." });
        }

        next();
      } catch (err) {
        return res.status(500).json({ error: "Authorization failed" });
      }
    };
  }

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) return null;

    return token;
  }
}
