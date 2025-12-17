import { IUseCase } from "../IUseCase";
import { Contact } from "../../domain/models/Contact";
import { IContactRepository } from "../../domain/repositories/IContactRepository";
import { ILeadCaptureRepository } from "../../domain/repositories/ILeadCaptureRepository";
import { IContactActivityRepository } from "../../domain/repositories/IContactActivityRepository";
import { ContactActivity } from "../../domain/models/ContactActivity";

export interface CaptureLeadInput {
  slug: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  [key: string]: any;
}

export interface CaptureLeadOutput {
  success: boolean;
  message: string;
  redirectUrl?: string;
}

export class CaptureLead implements IUseCase<CaptureLeadInput, CaptureLeadOutput> {
  constructor(
    private leadCaptureRepository: ILeadCaptureRepository,
    private contactRepository: IContactRepository,
    private activityRepository: IContactActivityRepository
  ) {}

  async execute(input: CaptureLeadInput): Promise<CaptureLeadOutput> {
    const leadCapture = await this.leadCaptureRepository.findBySlug(input.slug);

    if (!leadCapture) {
      throw new Error('Página de captura não encontrada');
    }

    if (!leadCapture.isActive) {
      throw new Error('Página de captura está inativa');
    }

    for (const field of leadCapture.requiredFields) {
      if (!input[field]) {
        throw new Error(`Campo obrigatório: ${field}`);
      }
    }

    if (input.email) {
      const existing = await this.contactRepository.findByEmail(input.email, leadCapture.userId);
      if (existing) {
        throw new Error('Email já cadastrado');
      }
    }

    const customFields: Record<string, any> = {};
    for (const key in input) {
      if (!['slug', 'name', 'email', 'phone', 'company'].includes(key)) {
        customFields[key] = input[key];
      }
    }

    const contact = Contact.create({
      userId: leadCapture.userId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      source: 'lead_capture',
      leadCaptureId: leadCapture.id,
      isLead: true
    });

    contact.calculateLeadScore();

    const savedContact = await this.contactRepository.save(contact);

    const activity = ContactActivity.createLeadCapturedActivity(
      savedContact.id,
      leadCapture.name
    );
    await this.activityRepository.save(activity);

    await this.leadCaptureRepository.incrementCaptures(leadCapture.id);

    return {
      success: true,
      message: leadCapture.successMessage,
      redirectUrl: leadCapture.redirectUrl || undefined
    };
  }
}
