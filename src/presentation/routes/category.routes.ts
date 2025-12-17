import { Router } from "express";
import { makeCategoryRepository } from "../../infra/database/factories/makeCategoryRepository";
import { CreateCategoryController } from "../controllers/inventory/CreateCategoryController";
import { ListCategoryController } from "../controllers/inventory/ListCategoryController";
import { UpdateCategoryController } from "../controllers/inventory/UpdateCategoryController";
import { DeleteCategoryController } from "../controllers/inventory/DeleteCategoryController";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";
import { requireBusinessProfile } from "../../middlewares/requireBusinessProfile";

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Product category management (requires businessProfileId in token)
 */

export function makeCategoryRoutes() {
    const router = Router();
    const authMiddleware = makeAuthMiddleware();
    const repository = makeCategoryRepository();

    /**
     * @swagger
     * /api/categories:
     *   post:
     *     summary: Create a new category
     *     tags: [Categories]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *             properties:
     *               name:
     *                 type: string
     *               description:
     *                 type: string
     *     responses:
     *       201:
     *         description: Category created
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.post("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new CreateCategoryController(repository).handle(req, res));
    
    /**
     * @swagger
     * /api/categories:
     *   get:
     *     summary: List all categories
     *     tags: [Categories]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of categories
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                   name:
     *                     type: string
     *                   description:
     *                     type: string
     *                   businessProfileId:
     *                     type: string
     *                   createdAt:
     *                     type: string
     *                     format: date-time
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.get("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new ListCategoryController(repository).handle(req, res));
    
    /**
     * @swagger
     * /api/categories/{id}:
     *   put:
     *     summary: Update a category
     *     tags: [Categories]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               description:
     *                 type: string
     *     responses:
     *       200:
     *         description: Category updated
     *       404:
     *         description: Category not found
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.put("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new UpdateCategoryController(repository).handle(req, res));
    
    /**
     * @swagger
     * /api/categories/{id}:
     *   delete:
     *     summary: Delete a category
     *     tags: [Categories]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       204:
     *         description: Category deleted
     *       404:
     *         description: Category not found
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.delete("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new DeleteCategoryController(repository).handle(req, res));

    return router;
}
