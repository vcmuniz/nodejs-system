import { IOrderRepository } from "../../../domain/repositories/IOrderRepository";
import { CreateOrder } from "../../../usercase/order/CreateOrder";
import { CreateOrderController } from "../../controllers/orders/CreateOrderController";
export function makeCreateOrderController(repository: IOrderRepository): CreateOrderController {
    const getAllOrderUseCase = new CreateOrder(repository);
    return new CreateOrderController(getAllOrderUseCase)
}