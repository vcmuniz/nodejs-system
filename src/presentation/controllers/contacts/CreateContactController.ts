import { Response } from "express";
import { IController } from "../IController";
import { CreateContact } from "../../../usercase/contacts/CreateContact";
import { AuthenticatedRequest } from "../../interfaces/AuthenticatedRequest";

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Criar novo contato ou lead
 *     tags:
 *       - Contatos
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
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@example.com
 *               phone:
 *                 type: string
 *                 example: 5511999999999
 *               cpf:
 *                 type: string
 *                 example: 12345678900
 *               company:
 *                 type: string
 *                 example: Empresa XYZ
 *               position:
 *                 type: string
 *                 example: Gerente de Vendas
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["cliente", "vip"]
 *               customFields:
 *                 type: object
 *                 example: { "interesse": "Produto Premium" }
 *               notes:
 *                 type: string
 *                 example: Cliente VIP interessado em produto Premium
 *               source:
 *                 type: string
 *                 enum: [manual, lead_capture, import, whatsapp]
 *                 example: manual
 *               isLead:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Contato criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autorizado
 */
export class CreateContactController implements IController {
  constructor(private createContact: CreateContact) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
      }

      const result = await this.createContact.execute({
        userId,
        ...req.body
      });

      res.status(201).json({
        success: true,
        data: result.contact.getPublicData()
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao criar contato'
      });
    }
  }
}
