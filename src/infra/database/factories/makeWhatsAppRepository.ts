import { WhatsAppFactory } from "../../factories/whatsapp/WhatsAppFactory";

export function makeWhatsAppRepository() {
    return WhatsAppFactory.getWhatsAppRepository();
}
