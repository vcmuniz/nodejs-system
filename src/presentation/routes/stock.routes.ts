import { Router } from "express";
import { makeStockEntryRepository } from "../../infra/database/factories/makeStockEntryRepository";
import { makeProductRepository } from "../../infra/database/factories/makeProductRepository";
import { CreateStockEntryController } from "../controllers/inventory/CreateStockEntryController";
import { ListStockEntriesController } from "../controllers/inventory/ListStockEntriesController";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";

export function makeStockRoutes() {
    const router = Router();
    const authMiddleware = makeAuthMiddleware();
    const stockRepository = makeStockEntryRepository();
    const productRepository = makeProductRepository();

    router.post("/", authMiddleware.authenticate(), (req, res) => new CreateStockEntryController(stockRepository, productRepository).handle(req, res));
    router.get("/", authMiddleware.authenticate(), (req, res) => new ListStockEntriesController(stockRepository).handle(req, res));

    return router;
}
