import { GetInstances } from "../../../usercase/whatsapp/GetInstances";
import { GetInstancesController } from "../../controllers/whatsapp/GetInstancesController";
import { WhatsAppFactory } from "../../../infra/factories/whatsapp/WhatsAppFactory";

export function makeGetInstancesController(): GetInstancesController {
  const evolutionAPI = WhatsAppFactory.getEvolutionAPI();
  const getInstancesUseCase = new GetInstances(evolutionAPI);
  return new GetInstancesController(getInstancesUseCase);
}
