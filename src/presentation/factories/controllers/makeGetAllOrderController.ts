import { IOrderRepository } from "../../../domain/repositories/IOrderRepository";
import { GetAllOrderController } from "../../controllers/orders/GetAllOrderController";
import { GetAllOrder } from "../../../usercase/order/GetAllOrder";

export function makeGetAllOrderController(repository: IOrderRepository): GetAllOrderController {
    const getAllOrderUseCase = new GetAllOrder(repository);
    return new GetAllOrderController(getAllOrderUseCase)
}
