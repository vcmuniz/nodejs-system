import { Order } from "../../../../../domain/models/Order";
import { IOrderRepository } from "../../../../../domain/repositories/IOrderRepository";

export class PrismaOrderRepository implements IOrderRepository {
    findAll(): Promise<Order[]> {
        throw new Error("Method not implemented.");
    }
    findById(id: string): Promise<Order | null> {
        throw new Error("Method not implemented.");
    }
    create(order: Order): Promise<Order> {
        throw new Error("Method not implemented.");
    }
    update(id: string, order: Partial<Order>): Promise<Order | null> {
        throw new Error("Method not implemented.");
    }
}