import { Router } from 'express';
import { CreateIntegrationCredentialController } from '../controllers/integration-credentials/CreateIntegrationCredentialController';
import { GetIntegrationCredentialsController } from '../controllers/integration-credentials/GetIntegrationCredentialsController';
import { GetIntegrationCredentialByIdController } from '../controllers/integration-credentials/GetIntegrationCredentialByIdController';
import { UpdateIntegrationCredentialController } from '../controllers/integration-credentials/UpdateIntegrationCredentialController';
import { DeleteIntegrationCredentialController } from '../controllers/integration-credentials/DeleteIntegrationCredentialController';
import { makeAuthMiddleware } from '../factories/middlewares/makeAuthMiddleware';

const router = Router();
const authMiddleware = makeAuthMiddleware();

const createController = new CreateIntegrationCredentialController();
const getController = new GetIntegrationCredentialsController();
const getByIdController = new GetIntegrationCredentialByIdController();
const updateController = new UpdateIntegrationCredentialController();
const deleteController = new DeleteIntegrationCredentialController();

/**
 * @swagger
 * tags:
 *   name: Integration Credentials
 *   description: Gerenciamento de credenciais de integração (apenas ADMIN)
 */

/**
 * @swagger
 * /api/integration-credentials:
 *   post:
 *     summary: Criar nova credencial de integração
 *     tags: [Integration Credentials]
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
 *               - type
 *               - credentials
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Evolution Principal"
 *               type:
 *                 type: string
 *                 example: "evolution"
 *               credentials:
 *                 type: object
 *                 example: { "apiToken": "xxx", "baseUrl": "http://localhost:8080" }
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Credencial criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post('/', authMiddleware.authenticate(), authMiddleware.requireAdmin(), createController.handle.bind(createController));

/**
 * @swagger
 * /api/integration-credentials:
 *   get:
 *     summary: Listar credenciais de integração
 *     tags: [Integration Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrar por tipo (evolution, twilio, etc)
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *         description: Retornar apenas credenciais ativas
 *     responses:
 *       200:
 *         description: Lista de credenciais
 *       401:
 *         description: Não autorizado
 */
router.get('/', authMiddleware.authenticate(), authMiddleware.requireAdmin(), getController.handle.bind(getController));

/**
 * @swagger
 * /api/integration-credentials/{id}:
 *   get:
 *     summary: Buscar credencial por ID
 *     tags: [Integration Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Credencial encontrada
 *       404:
 *         description: Credencial não encontrada
 */
router.get('/:id', authMiddleware.authenticate(), authMiddleware.requireAdmin(), getByIdController.handle.bind(getByIdController));

/**
 * @swagger
 * /api/integration-credentials/{id}:
 *   put:
 *     summary: Atualizar credencial
 *     tags: [Integration Credentials]
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
 *               credentials:
 *                 type: object
 *               isActive:
 *                 type: boolean
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Credencial atualizada
 *       400:
 *         description: Dados inválidos
 */
router.put('/:id', authMiddleware.authenticate(), authMiddleware.requireAdmin(), updateController.handle.bind(updateController));

/**
 * @swagger
 * /api/integration-credentials/{id}:
 *   delete:
 *     summary: Deletar credencial
 *     tags: [Integration Credentials]
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
 *         description: Credencial deletada
 *       400:
 *         description: Erro ao deletar
 */
router.delete('/:id', authMiddleware.authenticate(), authMiddleware.requireAdmin(), deleteController.handle.bind(deleteController));

export default router;
