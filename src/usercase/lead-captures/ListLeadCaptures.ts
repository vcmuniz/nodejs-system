import { IUseCase } from "../IUseCase";
import { LeadCapture } from "../../domain/models/LeadCapture";
import { ILeadCaptureRepository } from "../../domain/repositories/ILeadCaptureRepository";

export interface ListLeadCapturesInput {
  userId: string;
}

export interface ListLeadCapturesOutput {
  leadCaptures: LeadCapture[];
}

export class ListLeadCaptures implements IUseCase<ListLeadCapturesInput, ListLeadCapturesOutput> {
  constructor(private leadCaptureRepository: ILeadCaptureRepository) {}

  async execute(input: ListLeadCapturesInput): Promise<ListLeadCapturesOutput> {
    const leadCaptures = await this.leadCaptureRepository.findByUserId(input.userId);

    return { leadCaptures };
  }
}
