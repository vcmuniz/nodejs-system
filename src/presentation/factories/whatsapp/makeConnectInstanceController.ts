import { ConnectInstance } from "../../../usercase/whatsapp/ConnectInstance";
import { ConnectInstanceController } from "../../controllers/whatsapp/ConnectInstanceController";
import { WhatsAppFactory } from "../../../infra/factories/whatsapp/WhatsAppFactory";
import { makeWhatsAppRepository } from "../../../infra/database/factories/makeWhatsAppRepository";

export function makeConnectInstanceController(): ConnectInstanceController {
  const evolutionAPI = WhatsAppFactory.getEvolutionAPI();
  const whatsAppRepository = makeWhatsAppRepository();
  const connectInstanceUseCase = new ConnectInstance(evolutionAPI, whatsAppRepository);
  return new ConnectInstanceController(connectInstanceUseCase);
}
