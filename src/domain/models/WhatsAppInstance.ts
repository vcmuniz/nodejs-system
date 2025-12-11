// Domain Model
export class WhatsAppInstance {
  private id: string;
  private userId: string;
  private instanceName: string;
  private phoneNumber: string;
  private status: 'connected' | 'disconnected' | 'pending' | 'error';
  private qrCode?: string;
  private createdAt: Date;
  private updatedAt: Date;
  private lastConnectedAt?: Date;

  constructor(
    id: string,
    userId: string,
    instanceName: string,
    phoneNumber: string,
    status: 'connected' | 'disconnected' | 'pending' | 'error' = 'pending',
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    this.id = id;
    this.userId = userId;
    this.instanceName = instanceName;
    this.phoneNumber = phoneNumber;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getInstanceName(): string {
    return this.instanceName;
  }

  getPhoneNumber(): string {
    return this.phoneNumber;
  }

  getStatus(): string {
    return this.status;
  }

  setStatus(status: 'connected' | 'disconnected' | 'pending' | 'error'): void {
    this.status = status;
    this.updatedAt = new Date();
    if (status === 'connected') {
      this.lastConnectedAt = new Date();
    }
  }

  getQrCode(): string | undefined {
    return this.qrCode;
  }

  setQrCode(qrCode: string): void {
    this.qrCode = qrCode;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getLastConnectedAt(): Date | undefined {
    return this.lastConnectedAt;
  }

  isConnected(): boolean {
    return this.status === 'connected';
  }
}
