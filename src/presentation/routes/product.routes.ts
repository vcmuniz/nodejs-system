import { Router } from "express";
import { makeProductRepository } from "../../infra/database/factories/makeProductRepository";
import { CreateProductController } from "../controllers/inventory/CreateProductController";
import { ListProductController } from "../controllers/inventory/ListProductController";
import { GetProductController } from "../controllers/inventory/GetProductController";
import { UpdateProductController } from "../controllers/inventory/UpdateProductController";
import { DeleteProductController } from "../controllers/inventory/DeleteProductController";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";
import { requireBusinessProfile } from "../../middlewares/requireBusinessProfile";

export function makeProductRoutes() {
    const router = Router();
    const authMiddleware = makeAuthMiddleware();
    const repository = makeProductRepository();

    router.post("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new CreateProductController(repository).handle(req, res));
    router.get("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new ListProductController(repository).handle(req, res));
    router.get("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new GetProductController(repository).handle(req, res));
    router.put("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new UpdateProductController(repository).handle(req, res));
    router.delete("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new DeleteProductController(repository).handle(req, res));

    return router;
}
