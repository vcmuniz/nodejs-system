import { Router } from "express";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { makeGetAllOrderController } from "../factories/controllers/makeGetAllOrderController";
import { makeCreateOrderController } from "../factories/controllers/makeCreateOrderController";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";
import { requireBusinessProfile } from "../../middlewares/requireBusinessProfile";

export function makeOrderRoutes(orderRepository: IOrderRepository) {
    const router = Router();

    const authMiddleware = makeAuthMiddleware();

    router.get("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => makeGetAllOrderController(orderRepository).handle(req, res));
    router.post("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => makeCreateOrderController(orderRepository).handle(req, res));

    return router;
}