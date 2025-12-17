import { Router } from "express";
import { makeQuoteRepository } from "../../infra/database/factories/makeQuoteRepository";
import { makeProductRepository } from "../../infra/database/factories/makeProductRepository";
import { CreateQuoteController } from "../controllers/inventory/CreateQuoteController";
import { ListQuotesController } from "../controllers/inventory/ListQuotesController";
import { UpdateQuoteController } from "../controllers/inventory/UpdateQuoteController";
import { DeleteQuoteController } from "../controllers/inventory/DeleteQuoteController";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";
import { requireBusinessProfile } from "../../middlewares/requireBusinessProfile";

export function makeQuoteRoutes() {
    const router = Router();
    const authMiddleware = makeAuthMiddleware();
    const quoteRepository = makeQuoteRepository();
    const productRepository = makeProductRepository();

    router.post("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new CreateQuoteController(quoteRepository, productRepository).handle(req, res));
    router.get("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new ListQuotesController(quoteRepository).handle(req, res));
    router.put("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new UpdateQuoteController(quoteRepository).handle(req, res));
    router.delete("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new DeleteQuoteController(quoteRepository).handle(req, res));

    return router;
}
