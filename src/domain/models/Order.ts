export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
}

export class Order {
    constructor(
        public id: string,
        public userId: string,
        public status: string,
        public items: OrderItem[],
        public total: number,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) { }

    // Factory method
    static create(userId: string, items: OrderItem[]): Order {
        const id = Math.random().toString(36).substring(7);
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        return new Order(
            id,
            userId,
            'pending',
            items,
            totalAmount
        );
    }

    getPublicData() {
        return {
            id: this.id,
            status: this.status,
            total: this.total,
            items: this.items,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}