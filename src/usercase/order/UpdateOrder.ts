import { Order, OrderItem } from "../../domain/models/Order";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { IUseCase } from "./IUseCase";

interface IUpdateOrderInput {
    id: string;
    status?: string;
    items?: OrderItem[];
    total?: number;
}

export class UpdateOrder implements IUseCase<IUpdateOrderInput, Order | null> {
    constructor(private orderRepository: IOrderRepository) { }
    
    execute(input: IUpdateOrderInput): Promise<Order | null> {
        return this.orderRepository.update(input.id, {
            status: input.status,
            items: input.items,
            total: input.total,
        } as Partial<Order>);
    }
}
