import { beforeEach, describe, expect, it } from "vitest";
import { GetAllOrderController } from "./GetAllOrderController";
import { OrderRepositoryImpl } from "../../../infra/database/factories/repositories/OrderRepositoryImpl";
import { makeOrderRepository } from "../../../infra/database/factories/makeOrderRepository";
import { GetAllOrder } from "../../../usercase/order/GetAllOrder";
import { IOrderRepository } from "../../../domain/repositories/IOrderRepository";
import { Order } from "../../../domain/models/Order";

describe("GetAllOrderController - Unit Tests", () => {
    let controller: GetAllOrderController;
    let getAllOrderUseCase: GetAllOrder;
    let repository: IOrderRepository;

    beforeEach(() => {
        repository = makeOrderRepository()
        getAllOrderUseCase = new GetAllOrder(repository);
        controller = new GetAllOrderController(getAllOrderUseCase);
    });

    describe("handle", () => {
        it('should return all orders with status 200', async () => {
            const order1 = Order.create('user1', [{ productId: 'prod1', quantity: 1, price: 100 }]);
            const order2 = Order.create('user1', [{ productId: 'prod2', quantity: 2, price: 50 }]);

            await repository.create(order1);
            await repository.create(order2);

            const mockReq = {};
            let statusCode = 200;
            let jsonResponse: any = null;

            const mockRes = {
                status: (code: number) => {
                    statusCode = code;
                    return mockRes;
                },
                json: (data: any) => {
                    jsonResponse = data;
                }
            };

            await controller.handle(mockReq as any, mockRes as any);
            console.log("jsonResponse", jsonResponse);
            // Since the method is not implemented, we expect an error to be thrown
            expect(statusCode).toBe(200);
            expect(Array.isArray(jsonResponse)).toBe(true);
            expect(jsonResponse).toHaveLength(2);
        })
    });
});