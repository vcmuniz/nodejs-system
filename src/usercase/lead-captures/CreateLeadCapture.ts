import { IUseCase } from "../IUseCase";
import { LeadCapture } from "../../domain/models/LeadCapture";
import { ILeadCaptureRepository } from "../../domain/repositories/ILeadCaptureRepository";

export interface CreateLeadCaptureInput {
  userId: string;
  name: string;
  title: string;
  description?: string;
  fields: string[];
  requiredFields: string[];
  submitButtonText?: string;
  successMessage: string;
  redirectUrl?: string;
  webhookUrl?: string;
  notifyEmail?: string;
  slug: string;
}

export interface CreateLeadCaptureOutput {
  leadCapture: LeadCapture;
}

export class CreateLeadCapture implements IUseCase<CreateLeadCaptureInput, CreateLeadCaptureOutput> {
  constructor(private leadCaptureRepository: ILeadCaptureRepository) {}

  async execute(input: CreateLeadCaptureInput): Promise<CreateLeadCaptureOutput> {
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(input.slug)) {
      throw new Error('Slug deve conter apenas letras minúsculas, números e hífens');
    }

    const existing = await this.leadCaptureRepository.findBySlug(input.slug);
    if (existing) {
      throw new Error('Já existe uma página de captura com este slug');
    }

    const leadCapture = LeadCapture.create({
      userId: input.userId,
      name: input.name,
      title: input.title,
      description: input.description,
      fields: input.fields,
      requiredFields: input.requiredFields,
      submitButtonText: input.submitButtonText,
      successMessage: input.successMessage,
      redirectUrl: input.redirectUrl,
      webhookUrl: input.webhookUrl,
      notifyEmail: input.notifyEmail,
      slug: input.slug
    });

    if (!leadCapture.validateFields()) {
      throw new Error('Campos obrigatórios devem estar na lista de campos');
    }

    const saved = await this.leadCaptureRepository.save(leadCapture);

    return { leadCapture: saved };
  }
}
