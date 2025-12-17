import { Request, Response } from "express";
import { IController } from "../IController";
import { CreateLeadCapture } from "../../../usercase/lead-captures/CreateLeadCapture";
import { ListLeadCaptures } from "../../../usercase/lead-captures/ListLeadCaptures";
import { GetLeadCapture } from "../../../usercase/lead-captures/GetLeadCapture";
import { CaptureLead } from "../../../usercase/lead-captures/CaptureLead";
import { AuthenticatedRequest } from "../../interfaces/AuthenticatedRequest";

/**
 * @swagger
 * /api/lead-captures:
 *   post:
 *     summary: Criar nova página de captura de leads
 *     tags:
 *       - Lead Captures
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
 *               - title
 *               - slug
 *               - fields
 *               - requiredFields
 *               - successMessage
 *             properties:
 *               name:
 *                 type: string
 *                 example: Landing Page E-book Marketing
 *               title:
 *                 type: string
 *                 example: Baixe nosso E-book Grátis
 *               description:
 *                 type: string
 *                 example: Aprenda tudo sobre marketing digital
 *               slug:
 *                 type: string
 *                 example: ebook-marketing
 *               fields:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["name", "email", "phone"]
 *               requiredFields:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["name", "email"]
 *               submitButtonText:
 *                 type: string
 *                 example: Baixar E-book
 *               successMessage:
 *                 type: string
 *                 example: Obrigado! Enviamos o e-book para seu email.
 *               redirectUrl:
 *                 type: string
 *                 example: https://meusite.com/obrigado
 *               webhookUrl:
 *                 type: string
 *                 example: https://meusite.com/webhook
 *               notifyEmail:
 *                 type: string
 *                 example: vendas@meusite.com
 *     responses:
 *       201:
 *         description: Página criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LeadCapture'
 *                 publicUrl:
 *                   type: string
 *                   example: http://localhost:3000/public/lead/ebook-marketing
 *       400:
 *         description: Erro de validação (slug já existe, campos inválidos)
 *       401:
 *         description: Não autorizado
 *   get:
 *     summary: Listar páginas de captura
 *     tags:
 *       - Lead Captures
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de páginas de captura
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
 *                     $ref: '#/components/schemas/LeadCapture'
 *       401:
 *         description: Não autorizado
 */
export class CreateLeadCaptureController implements IController {
  constructor(private createLeadCapture: CreateLeadCapture) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const businessProfileId = req.user?.businessProfileId;
      
      if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
      }

      if (!businessProfileId) {
        res.status(400).json({ 
          success: false, 
          message: 'Selecione uma organização primeiro',
          action: 'SELECT_BUSINESS_PROFILE'
        });
        return;
      }

      const result = await this.createLeadCapture.execute({
        userId,
        businessProfileId,
        ...req.body
      });

      res.status(201).json({
        success: true,
        data: result.leadCapture.getFullData(),
        publicUrl: `${req.protocol}://${req.get('host')}/public/lead/${result.leadCapture.slug}`
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao criar página de captura'
      });
    }
  }
}

export class ListLeadCapturesController implements IController {
  constructor(private listLeadCaptures: ListLeadCaptures) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const businessProfileId = req.user?.businessProfileId;
      
      if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
      }

      if (!businessProfileId) {
        res.status(400).json({ 
          success: false, 
          message: 'Selecione uma organização primeiro',
          action: 'SELECT_BUSINESS_PROFILE'
        });
        return;
      }

      const result = await this.listLeadCaptures.execute({ 
        userId, 
        businessProfileId 
      });

      res.status(200).json({
        success: true,
        data: result.leadCaptures.map(lc => lc.getFullData())
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao listar páginas de captura'
      });
    }
  }
}

/**
 * @swagger
 * /public/lead/{slug}:
 *   get:
 *     summary: Obter configuração pública da página de captura
 *     tags:
 *       - Lead Captures (Público)
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug da página de captura
 *         example: ebook-marketing
 *     responses:
 *       200:
 *         description: Configuração da página
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     fields:
 *                       type: array
 *                       items:
 *                         type: string
 *                     requiredFields:
 *                       type: array
 *                       items:
 *                         type: string
 *                     submitButtonText:
 *                       type: string
 *       404:
 *         description: Página não encontrada
 *   post:
 *     summary: Enviar lead (captura pública)
 *     description: Endpoint público para capturar leads sem autenticação
 *     tags:
 *       - Lead Captures (Público)
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug da página de captura
 *         example: ebook-marketing
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
 *                 example: Maria Santos
 *               email:
 *                 type: string
 *                 example: maria@example.com
 *               phone:
 *                 type: string
 *                 example: 5521988888888
 *               company:
 *                 type: string
 *                 example: ABC Ltda
 *           examples:
 *             basic:
 *               summary: Exemplo básico
 *               value:
 *                 name: Maria Santos
 *                 email: maria@example.com
 *                 phone: 5521988888888
 *             complete:
 *               summary: Exemplo completo
 *               value:
 *                 name: João Silva
 *                 email: joao@example.com
 *                 phone: 5511999999999
 *                 company: Empresa XYZ
 *     responses:
 *       200:
 *         description: Lead capturado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Obrigado! Enviamos o e-book para seu email.
 *                 redirectUrl:
 *                   type: string
 *                   example: https://meusite.com/obrigado
 *       400:
 *         description: Erro de validação (campos obrigatórios, email já cadastrado)
 *       404:
 *         description: Página não encontrada
 */
export class GetLeadCapturePublicController implements IController {
  constructor(private getLeadCapture: GetLeadCapture) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.getLeadCapture.execute({
        slug: req.params.slug
      });

      res.status(200).json({
        success: true,
        data: result.leadCapture.getPublicData()
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Página não encontrada'
      });
    }
  }
}

export class CaptureLeadController implements IController {
  constructor(private captureLead: CaptureLead) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.captureLead.execute({
        slug: req.params.slug,
        ...req.body
      });

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao capturar lead'
      });
    }
  }
}
