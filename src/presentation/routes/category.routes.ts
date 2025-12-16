import { Router } from "express";
import { makeCategoryRepository } from "../../infra/database/factories/makeCategoryRepository";
import { CreateCategoryController } from "../controllers/inventory/CreateCategoryController";
import { ListCategoryController } from "../controllers/inventory/ListCategoryController";
import { UpdateCategoryController } from "../controllers/inventory/UpdateCategoryController";
import { DeleteCategoryController } from "../controllers/inventory/DeleteCategoryController";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";

export function makeCategoryRoutes() {
    const router = Router();
    const authMiddleware = makeAuthMiddleware();
    const repository = makeCategoryRepository();

    router.post("/", authMiddleware.authenticate(), (req, res) => new CreateCategoryController(repository).handle(req, res));
    router.get("/", authMiddleware.authenticate(), (req, res) => new ListCategoryController(repository).handle(req, res));
    router.put("/:id", authMiddleware.authenticate(), (req, res) => new UpdateCategoryController(repository).handle(req, res));
    router.delete("/:id", authMiddleware.authenticate(), (req, res) => new DeleteCategoryController(repository).handle(req, res));

    return router;
}
