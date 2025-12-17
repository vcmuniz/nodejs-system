import { Response } from "express";
import { IController } from "../IController";
import { ListUserBusinessProfiles } from "../../../usercase/business-profile/ListUserBusinessProfiles";
import { SelectBusinessProfile } from "../../../usercase/business-profile/SelectBusinessProfile";
import { AuthenticatedRequest } from "../../interfaces/AuthenticatedRequest";

export class ListBusinessProfilesController implements IController {
  constructor(private listUserBusinessProfiles: ListUserBusinessProfiles) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
      }

      const result = await this.listUserBusinessProfiles.execute({ userId });

      res.status(200).json({
        success: true,
        data: result.businessProfiles
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao listar organizações'
      });
    }
  }
}

export class SelectBusinessProfileController implements IController {
  constructor(private selectBusinessProfile: SelectBusinessProfile) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const email = req.user?.email;
      
      if (!userId || !email) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
      }

      const { businessProfileId } = req.body;

      if (!businessProfileId) {
        res.status(400).json({ 
          success: false, 
          message: 'businessProfileId é obrigatório' 
        });
        return;
      }

      const result = await this.selectBusinessProfile.execute({
        userId,
        email,
        name: req.user?.name,
        role: req.user?.role,
        businessProfileId
      });

      res.status(200).json({
        success: true,
        token: result.token,
        businessProfile: result.businessProfile
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao selecionar organização'
      });
    }
  }
}

export class SwitchBusinessProfileController implements IController {
  constructor(private selectBusinessProfile: SelectBusinessProfile) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const email = req.user?.email;
      
      if (!userId || !email) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
      }

      const { businessProfileId } = req.body;

      if (!businessProfileId) {
        res.status(400).json({ 
          success: false, 
          message: 'businessProfileId é obrigatório' 
        });
        return;
      }

      const result = await this.selectBusinessProfile.execute({
        userId,
        email,
        name: req.user?.name,
        role: req.user?.role,
        businessProfileId
      });

      res.status(200).json({
        success: true,
        message: 'Organização alterada com sucesso',
        token: result.token,
        businessProfile: result.businessProfile
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao trocar organização'
      });
    }
  }
}
