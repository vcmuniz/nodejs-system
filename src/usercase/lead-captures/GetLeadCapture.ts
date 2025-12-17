import { IUseCase } from "../IUseCase";
import { LeadCapture } from "../../domain/models/LeadCapture";
import { ILeadCaptureRepository } from "../../domain/repositories/ILeadCaptureRepository";

export interface GetLeadCaptureInput {
  slug: string;
}

export interface GetLeadCaptureOutput {
  leadCapture: LeadCapture;
}

export class GetLeadCapture implements IUseCase<GetLeadCaptureInput, GetLeadCaptureOutput> {
  constructor(private leadCaptureRepository: ILeadCaptureRepository) {}

  async execute(input: GetLeadCaptureInput): Promise<GetLeadCaptureOutput> {
    const leadCapture = await this.leadCaptureRepository.findBySlug(input.slug);

    if (!leadCapture) {
      throw new Error('Página de captura não encontrada');
    }

    return { leadCapture };
  }
}
