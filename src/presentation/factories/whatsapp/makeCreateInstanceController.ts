import { CreateInstance } from "../../../usercase/whatsapp/CreateInstance";
import { CreateInstanceController } from "../../controllers/whatsapp/CreateInstanceController";
import { WhatsAppFactory } from "../../../infra/factories/whatsapp/WhatsAppFactory";
import { makeWhatsAppRepository } from "../../../infra/database/factories/makeWhatsAppRepository";

export function makeCreateInstanceController(): CreateInstanceController {
  const evolutionAPI = WhatsAppFactory.getEvolutionAPI();
  const whatsappRepository = makeWhatsAppRepository();
  const createInstanceUseCase = new CreateInstance(evolutionAPI, whatsappRepository);
  return new CreateInstanceController(createInstanceUseCase);
}
