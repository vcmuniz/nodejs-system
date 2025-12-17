export class Contact {
  constructor(
    public id: string,
    public userId: string,
    public name: string,
    public email?: string | null,
    public phone?: string | null,
    public cpf?: string | null,
    public company?: string | null,
    public position?: string | null,
    public website?: string | null,
    public street?: string | null,
    public number?: string | null,
    public complement?: string | null,
    public neighborhood?: string | null,
    public city?: string | null,
    public state?: string | null,
    public zipCode?: string | null,
    public country: string = 'Brasil',
    public birthDate?: Date | null,
    public notes?: string | null,
    public tags?: string[] | null,
    public customFields?: Record<string, any> | null,
    public source?: string | null,
    public sourceUrl?: string | null,
    public leadCaptureId?: string | null,
    public status: string = 'active',
    public isLead: boolean = false,
    public leadScore: number = 0,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public convertedAt?: Date | null
  ) {}

  static create(data: {
    userId: string;
    name: string;
    email?: string;
    phone?: string;
    cpf?: string;
    company?: string;
    position?: string;
    isLead?: boolean;
    source?: string;
    leadCaptureId?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  }): Contact {
    const id = crypto.randomUUID();
    return new Contact(
      id,
      data.userId,
      data.name,
      data.email,
      data.phone,
      data.cpf,
      data.company,
      data.position,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'Brasil',
      undefined,
      undefined,
      data.tags,
      data.customFields,
      data.source || 'manual',
      undefined,
      data.leadCaptureId,
      'active',
      data.isLead || false,
      0
    );
  }

  convertToContact(notes?: string): void {
    this.isLead = false;
    this.convertedAt = new Date();
    if (notes) {
      this.notes = notes;
    }
  }

  calculateLeadScore(): number {
    let score = 0;
    
    if (this.email) score += 10;
    if (this.phone) score += 10;
    if (this.company) score += 10;
    if (this.cpf) score += 10;
    
    if (this.source === 'lead_capture') score += 20;
    else if (this.source === 'manual') score += 10;
    
    this.leadScore = score;
    return score;
  }

  getPublicData() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      company: this.company,
      position: this.position,
      isLead: this.isLead,
      leadScore: this.leadScore,
      status: this.status,
      tags: this.tags,
      createdAt: this.createdAt,
      convertedAt: this.convertedAt
    };
  }
}
