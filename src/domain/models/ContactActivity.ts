export class ContactActivity {
  constructor(
    public id: string,
    public contactId: string,
    public userId: string | null,
    public type: string,
    public title: string,
    public description?: string | null,
    public metadata?: Record<string, any> | null,
    public createdAt: Date = new Date()
  ) {}

  static create(data: {
    contactId: string;
    userId?: string;
    type: string;
    title: string;
    description?: string;
    metadata?: Record<string, any>;
  }): ContactActivity {
    const id = crypto.randomUUID();
    return new ContactActivity(
      id,
      data.contactId,
      data.userId || null,
      data.type,
      data.title,
      data.description,
      data.metadata
    );
  }

  static createLeadCapturedActivity(contactId: string, leadCaptureName: string): ContactActivity {
    return ContactActivity.create({
      contactId,
      type: 'lead_captured',
      title: 'Lead capturado',
      description: `Lead capturado via ${leadCaptureName}`,
      metadata: { source: 'lead_capture' }
    });
  }

  static createConversionActivity(contactId: string, userId: string, notes?: string): ContactActivity {
    return ContactActivity.create({
      contactId,
      userId,
      type: 'status_change',
      title: 'Lead convertido em contato',
      description: notes || 'Lead convertido em contato',
      metadata: { action: 'converted_to_contact' }
    });
  }

  static createNoteActivity(contactId: string, userId: string, note: string): ContactActivity {
    return ContactActivity.create({
      contactId,
      userId,
      type: 'note',
      title: 'Nota adicionada',
      description: note
    });
  }

  getData() {
    return {
      id: this.id,
      contactId: this.contactId,
      userId: this.userId,
      type: this.type,
      title: this.title,
      description: this.description,
      metadata: this.metadata,
      createdAt: this.createdAt
    };
  }
}
