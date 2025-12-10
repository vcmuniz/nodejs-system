import { Order } from "../../../../../domain/models/Order";
import { IOrderRepository } from "../../../../../domain/repositories/IOrderRepository";

export class MemoryOrderRepository implements IOrderRepository {
    private itens: Order[] = []
    create(order: Order): Promise<Order> {
        this.itens.push(order);

        return Promise.resolve(order);
    }
    findAll(): Promise<Order[]> {
        return Promise.resolve(this.itens);
    }

    findById(id: string): Promise<Order | null> {
        const order = this.itens.find(o => o.id === id);
        return Promise.resolve(order || null);
    }

    update(id: string, orderData: Partial<Order>): Promise<Order | null> {
        const index = this.itens.findIndex(order => order.id === id);
        if (index === -1) return Promise.resolve(null);

        const existing = this.itens[index];
        const updated = new Order(
            existing.id,
            existing.userId,
            orderData.status !== undefined ? orderData.status : existing.status,
            orderData.items !== undefined ? orderData.items : existing.items,
            orderData.total !== undefined ? orderData.total : existing.total,
            existing.createdAt,
            new Date()
        );

        this.itens[index] = updated;
        return Promise.resolve(updated);
    }
}