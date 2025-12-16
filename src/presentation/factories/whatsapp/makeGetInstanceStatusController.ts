import { GetInstanceStatus } from "../../../usercase/whatsapp/GetInstanceStatus";
import { GetInstanceStatusController } from "../../controllers/whatsapp/GetInstanceStatusController";
import { WhatsAppFactory } from "../../../infra/factories/whatsapp/WhatsAppFactory";
import { makeWhatsAppRepository } from "../../../infra/database/factories/makeWhatsAppRepository";

export function makeGetInstanceStatusController(): GetInstanceStatusController {
  const evolutionAPI = WhatsAppFactory.getEvolutionAPI();
  const whatsappRepository = makeWhatsAppRepository();
  const getInstanceStatusUseCase = new GetInstanceStatus(evolutionAPI, whatsappRepository);
  return new GetInstanceStatusController(getInstanceStatusUseCase);
}
