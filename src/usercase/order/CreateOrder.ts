import { Order, OrderItem } from "../../domain/models/Order";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { IUseCase } from "./IUseCase";

interface ICreateOrderInput {
    userId: string;
    items: OrderItem[];
}

export class CreateOrder implements IUseCase<ICreateOrderInput, Order> {
    constructor(private orderRepository: IOrderRepository) { }

    execute(input: ICreateOrderInput): Promise<Order> {
        const order = Order.create(input.userId, input.items);

        return this.orderRepository.create(order);
    }

}