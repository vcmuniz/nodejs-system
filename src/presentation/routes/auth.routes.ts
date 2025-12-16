import { Router } from "express";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { makeSignInController } from "../factories/controllers/makeSignInController";
import { ITokenProvider } from "../../domain/providers/ITokenProvider";

export function makeAuthRoutes(userRepository: IUserRepository, tokenProvider: ITokenProvider) {
    const router = Router();

    router.post("/signin", (req, res) => makeSignInController(userRepository, tokenProvider).handle(req, res));

    return router;
}
