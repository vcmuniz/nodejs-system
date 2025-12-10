import { Order } from "../../../../domain/models/Order";
import { IOrderRepository } from "../../../../domain/repositories/IOrderRepository";

export class OrderRepositoryImpl implements IOrderRepository {
    constructor(private impl: IOrderRepository) { }

    findAll(): Promise<Order[]> {
        return this.impl.findAll();
    }
    findById(id: string): Promise<Order | null> {
        return this.impl.findById(id);
    }
    create(order: Order): Promise<Order> {
        return this.impl.create(order);
    }
    update(id: string, order: Partial<Order>): Promise<Order | null> {
        return this.impl.update(id, order);
    }

}