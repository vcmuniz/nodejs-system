import { Router } from "express";
import { GetAllOrderController } from "../controllers/orders/GetAllOrderController";

export function createOrderRoutes() {
    const router = Router();

    router.get("/", GetAllOrderController.prototype.handle);

    return router;
}