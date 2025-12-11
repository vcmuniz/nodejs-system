import { Router } from "express";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { makeGetAllOrderController } from "../factories/controllers/makeGetAllOrderController";
import { makeCreateOrderController } from "../factories/controllers/makeCreateOrderController";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";

export function makeOrderRoutes(orderRepository: IOrderRepository) {
    const router = Router();

    const authMiddleware = makeAuthMiddleware();

    router.get("/", authMiddleware.authenticate(), (req, res) => makeGetAllOrderController(orderRepository).handle(req, res));
    router.post("/", authMiddleware.authenticate(), (req, res) => makeCreateOrderController(orderRepository).handle(req, res));

    return router;
}