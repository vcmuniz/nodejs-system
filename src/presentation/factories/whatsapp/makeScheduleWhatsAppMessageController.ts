import { ScheduleWhatsAppMessageController } from "../../controllers/whatsapp/ScheduleWhatsAppMessageController";
import { WhatsAppFactory } from "../../../infra/factories/whatsapp/WhatsAppFactory";

export function makeScheduleWhatsAppMessageController(): ScheduleWhatsAppMessageController {
  return WhatsAppFactory.getScheduleWhatsAppMessageController();
}
