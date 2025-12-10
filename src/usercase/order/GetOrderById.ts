import { Order } from "../../domain/models/Order";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { IUseCase } from "./IUseCase";

export class GetOrderById implements IUseCase<string, Order | null> {
    constructor(private orderRepository: IOrderRepository) { }
    execute(id: string): Promise<Order | null> {
        return this.orderRepository.findById(id);
    }
}
