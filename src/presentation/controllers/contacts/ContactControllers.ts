import { Response } from "express";
import { IController } from "../IController";
import { ListContacts } from "../../../usercase/contacts/ListContacts";
import { GetContact } from "../../../usercase/contacts/GetContact";
import { UpdateContact } from "../../../usercase/contacts/UpdateContact";
import { DeleteContact } from "../../../usercase/contacts/DeleteContact";
import { ConvertLeadToContact } from "../../../usercase/contacts/ConvertLeadToContact";
import { AuthenticatedRequest } from "../../interfaces/AuthenticatedRequest";

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Listar contatos com filtros e paginação
 *     tags:
 *       - Contatos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, blocked]
 *         description: Filtrar por status
 *       - in: query
 *         name: isLead
 *         schema:
 *           type: boolean
 *         description: Filtrar apenas leads
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filtrar por origem
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome, email, telefone ou empresa
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filtrar por tags (separadas por vírgula)
 *     responses:
 *       200:
 *         description: Lista de contatos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contact'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Não autorizado
 */
export class ListContactsController implements IController {
  constructor(private listContacts: ListContacts) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
      }

      const filters = {
        status: req.query.status as string,
        isLead: req.query.isLead === 'true',
        leadCaptureId: req.query.leadCaptureId as string,
        source: req.query.source as string,
        search: req.query.search as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await this.listContacts.execute({ userId, filters });

      res.status(200).json({
        success: true,
        data: result.contacts.map(c => c.getPublicData()),
        pagination: result.pagination
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao listar contatos'
      });
    }
  }
}

/**
 * @swagger
 * /api/contacts/{id}:
 *   get:
 *     summary: Buscar contato por ID
 *     tags:
 *       - Contatos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contato
 *     responses:
 *       200:
 *         description: Contato encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contato não encontrado
 *       401:
 *         description: Não autorizado
 *   put:
 *     summary: Atualizar contato
 *     tags:
 *       - Contatos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, blocked]
 *     responses:
 *       200:
 *         description: Contato atualizado
 *       404:
 *         description: Contato não encontrado
 *       401:
 *         description: Não autorizado
 *   delete:
 *     summary: Deletar contato
 *     tags:
 *       - Contatos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contato
 *     responses:
 *       200:
 *         description: Contato deletado
 *       404:
 *         description: Contato não encontrado
 *       401:
 *         description: Não autorizado
 */
export class GetContactController implements IController {
  constructor(private getContact: GetContact) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
      }

      const result = await this.getContact.execute({
        id: req.params.id,
        userId
      });

      res.status(200).json({
        success: true,
        data: result.contact
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao buscar contato'
      });
    }
  }
}

export class UpdateContactController implements IController {
  constructor(private updateContact: UpdateContact) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
      }

      const result = await this.updateContact.execute({
        id: req.params.id,
        userId,
        ...req.body
      });

      res.status(200).json({
        success: true,
        data: result.contact.getPublicData()
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao atualizar contato'
      });
    }
  }
}

export class DeleteContactController implements IController {
  constructor(private deleteContact: DeleteContact) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
      }

      await this.deleteContact.execute({
        id: req.params.id,
        userId
      });

      res.status(200).json({
        success: true,
        message: 'Contato deletado com sucesso'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao deletar contato'
      });
    }
  }
}

/**
 * @swagger
 * /api/contacts/{id}/convert:
 *   post:
 *     summary: Converter lead em contato
 *     tags:
 *       - Contatos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do lead
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: Cliente fechou contrato - Produto Premium
 *     responses:
 *       200:
 *         description: Lead convertido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Erro ao converter (ex. não é um lead)
 *       401:
 *         description: Não autorizado
 */
export class ConvertLeadController implements IController {
  constructor(private convertLead: ConvertLeadToContact) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
      }

      const result = await this.convertLead.execute({
        id: req.params.id,
        userId,
        notes: req.body.notes
      });

      res.status(200).json({
        success: true,
        message: 'Lead convertido em contato',
        data: result.contact.getPublicData()
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao converter lead'
      });
    }
  }
}
