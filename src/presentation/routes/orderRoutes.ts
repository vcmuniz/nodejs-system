import { Router } from "express";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { makeGetAllOrderController } from "../factories/controllers/makeGetAllOrderController";
import { makeCreateOrderController } from "../factories/controllers/makeCreateOrderController";

export function createOrderRoutes(orderRepository: IOrderRepository) {
    const router = Router();

    router.get("/", (req, res) => makeGetAllOrderController(orderRepository).handle(req, res));
    router.post("/", (req, res) => makeCreateOrderController(orderRepository).handle(req, res));
    
    return router;
}