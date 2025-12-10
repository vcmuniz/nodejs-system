import { Order } from "../../domain/models/Order";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { IUseCase } from "./IUseCase";

export class GetAllOrder implements IUseCase<void, Order[]> {
    constructor(private orderRepository: IOrderRepository) { }
    execute(): Promise<Order[]> {
        return this.orderRepository.findAll();
    }

}