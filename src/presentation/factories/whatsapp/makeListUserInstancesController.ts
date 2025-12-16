import { ListUserInstances } from "../../../usercase/whatsapp/ListUserInstances";
import { ListUserInstancesController } from "../../controllers/whatsapp/ListUserInstancesController";
import { makeWhatsAppRepository } from "../../../infra/database/factories/makeWhatsAppRepository";

export function makeListUserInstancesController(): ListUserInstancesController {
  const whatsappRepository = makeWhatsAppRepository();
  const listUserInstancesUseCase = new ListUserInstances(whatsappRepository);
  return new ListUserInstancesController(listUserInstancesUseCase);
}
