export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export class OrderEntity {
  constructor(
    public id: string,
    public userId: string,
    public orderNumber: string,
    public clientName: string,
    public subtotal: number,
    public total: number,
    public status: OrderStatus = 'DRAFT',
    public quoteId?: string,
    public clientEmail?: string,
    public clientPhone?: string,
    public address?: string,
    public discount: number = 0,
    public tax: number = 0,
    public notes?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  calculateTotal(subtotal: number, discount: number = 0, tax: number = 0): number {
    return subtotal - discount + tax;
  }

  canBeCancelled(): boolean {
    return !['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(this.status);
  }
}
