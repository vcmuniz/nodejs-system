import { Order } from "../models/Order";

export interface IOrderRepository {
    findAll(): Promise<Order[]>;
    findById(id: string): Promise<Order | null>;
    create(order: Order): Promise<Order>;
    update(id: string, order: Partial<Order>): Promise<Order | null>;
}