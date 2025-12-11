import { Express, Router } from "express"
import { makeAuthRoutes } from "./auth.routes";
import { makeOrderRoutes } from "./order.routes";
import { makeUserRepository } from "../../infra/database/factories/makeUserRepository";
import { makeOrderRepository } from "../../infra/database/factories/makeOrderRepository";
import JsonWebTokenProvider from "../../infra/auth/JsonWebTokenProvider";
import { makeIndexRouter } from "./index.routes";

export default (app: Express): void => {
    app.use("/", makeIndexRouter());
    app.use("/auth", makeAuthRoutes(makeUserRepository(), new JsonWebTokenProvider()));
    app.use("/orders", makeOrderRoutes(makeOrderRepository()))
}