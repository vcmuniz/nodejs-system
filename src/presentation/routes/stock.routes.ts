import { Router } from "express";
import { makeStockEntryRepository } from "../../infra/database/factories/makeStockEntryRepository";
import { makeProductRepository } from "../../infra/database/factories/makeProductRepository";
import { CreateStockEntryController } from "../controllers/inventory/CreateStockEntryController";
import { ListStockEntriesController } from "../controllers/inventory/ListStockEntriesController";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";
import { requireBusinessProfile } from "../../middlewares/requireBusinessProfile";

/**
 * @swagger
 * tags:
 *   name: Stock
 *   description: Stock entry management (requires businessProfileId in token)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StockEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         productId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [in, out, adjustment]
 *         quantity:
 *           type: integer
 *         reason:
 *           type: string
 *         businessProfileId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

export function makeStockRoutes() {
    const router = Router();
    const authMiddleware = makeAuthMiddleware();
    const stockRepository = makeStockEntryRepository();
    const productRepository = makeProductRepository();

    router.post("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
        new CreateStockEntryController(stockRepository, productRepository).handle(req, res)
    );
    
    router.get("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
        new ListStockEntriesController(stockRepository).handle(req, res)
    );

    return router;
}
