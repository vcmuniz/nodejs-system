export class LeadCapture {
  constructor(
    public id: string,
    public userId: string,
    public name: string,
    public title: string,
    public description: string | null,
    public fields: string[],
    public requiredFields: string[],
    public submitButtonText: string,
    public successMessage: string,
    public redirectUrl: string | null,
    public webhookUrl: string | null,
    public notifyEmail: string | null,
    public isActive: boolean,
    public slug: string,
    public totalCaptures: number,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(data: {
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
  }): LeadCapture {
    const id = crypto.randomUUID();
    return new LeadCapture(
      id,
      data.userId,
      data.name,
      data.title,
      data.description || null,
      data.fields,
      data.requiredFields,
      data.submitButtonText || 'Enviar',
      data.successMessage,
      data.redirectUrl || null,
      data.webhookUrl || null,
      data.notifyEmail || null,
      true,
      data.slug,
      0,
      new Date(),
      new Date()
    );
  }

  incrementCaptures(): void {
    this.totalCaptures += 1;
    this.updatedAt = new Date();
  }

  validateFields(): boolean {
    return this.requiredFields.every(field => this.fields.includes(field));
  }

  getPublicData() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      fields: this.fields,
      requiredFields: this.requiredFields,
      submitButtonText: this.submitButtonText,
      successMessage: this.successMessage,
      redirectUrl: this.redirectUrl,
      slug: this.slug
    };
  }

  getFullData() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      title: this.title,
      description: this.description,
      fields: this.fields,
      requiredFields: this.requiredFields,
      submitButtonText: this.submitButtonText,
      successMessage: this.successMessage,
      redirectUrl: this.redirectUrl,
      webhookUrl: this.webhookUrl,
      notifyEmail: this.notifyEmail,
      isActive: this.isActive,
      slug: this.slug,
      totalCaptures: this.totalCaptures,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
