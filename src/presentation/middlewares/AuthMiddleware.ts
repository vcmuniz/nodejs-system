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
        const token = this.extractToken(req);
        if (!token) {
          return res.status(401).json({ error: "Token not provided" });
        }

        const decoded = await this.tokenGenerator.decodeToken(token);
        if (!decoded) {
          return res.status(401).json({ error: "Invalid token" });
        }

        const user = await this.userFetcher.getUserById(decoded.userId);
        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }

        req.user = {
          id: decoded.userId,
          email: decoded.email,
          role: user.role,
        };

        next();
      } catch (err) {
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
