export class StockEntry {
  constructor(
    public id: string,
    public userId: string,
    public productId: string,
    public quantity: number,
    public description?: string,
    public reference?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  getQuantity(): number {
    return this.quantity;
  }

  hasReference(): boolean {
    return !!this.reference;
  }
}
