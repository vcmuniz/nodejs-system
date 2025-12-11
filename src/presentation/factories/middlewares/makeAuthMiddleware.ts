import { makeUserFetcher } from "../../../domain/auth/makeUserFetcher";
import JsonWebTokenProvider from "../../../infra/auth/JsonWebTokenProvider";
import { AuthMiddleware } from "../../middlewares/AuthMiddleware";

export function makeAuthMiddleware() {
    const tokenGenerator = new JsonWebTokenProvider();

    const userFetcher = makeUserFetcher()
    return new AuthMiddleware(tokenGenerator, userFetcher);
}
