export type ProductType = 'PHYSICAL' | 'DIGITAL' | 'SERVICE';

export interface ProductImage {
  url: string;
  alt?: string;
}

export class Product {
  constructor(
    public id: string,
    public userId: string,
    public categoryId: string,
    public name: string,
    public sku: string,
    public price: number,
    public quantity: number,
    public description?: string,
    public type: ProductType = 'PHYSICAL',
    public cost?: number,
    public minQuantity: number = 0,
    public images: ProductImage[] = [],
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  isLowStock(): boolean {
    return this.quantity <= this.minQuantity;
  }

  getProfitMargin(): number {
    if (!this.cost || this.price === 0) return 0;
    return ((this.price - this.cost) / this.price) * 100;
  }

  canSell(quantity: number): boolean {
    return this.quantity >= quantity;
  }

  updateQuantity(quantity: number): void {
    this.quantity = quantity;
    this.updatedAt = new Date();
  }

  addImages(images: ProductImage[]): void {
    this.images = [...this.images, ...images];
    this.updatedAt = new Date();
  }

  removeImage(url: string): void {
    this.images = this.images.filter(img => img.url !== url);
    this.updatedAt = new Date();
  }
}
