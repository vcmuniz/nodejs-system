import { SendWhatsAppMessage } from "../../../usercase/whatsapp/SendWhatsAppMessage";
import { SendWhatsAppMessageController } from "../../controllers/whatsapp/SendWhatsAppMessageController";
import { WhatsAppFactory } from "../../../infra/factories/whatsapp/WhatsAppFactory";

export function makeSendWhatsAppMessageController(): SendWhatsAppMessageController {
  const sendWhatsAppMessageUseCase = WhatsAppFactory.getSendWhatsAppMessage();
  return new SendWhatsAppMessageController(sendWhatsAppMessageUseCase);
}
