export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface QuoteItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export class Quote {
  constructor(
    public id: string,
    public userId: string,
    public quoteNumber: string,
    public clientName: string,
    public subtotal: number,
    public total: number,
    public status: QuoteStatus = 'DRAFT',
    public clientEmail?: string,
    public clientPhone?: string,
    public discount: number = 0,
    public tax: number = 0,
    public notes?: string,
    public validUntil?: Date,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  isExpired(): boolean {
    if (!this.validUntil) return false;
    return new Date() > this.validUntil;
  }

  canAccept(): boolean {
    return this.status === 'SENT' || this.status === 'DRAFT';
  }

  calculateTotal(subtotal: number, discount: number = 0, tax: number = 0): number {
    return subtotal - discount + tax;
  }
}
