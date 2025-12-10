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

        it('should return empty array when no orders exist', async () => {
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

            expect(statusCode).toBe(200);
            expect(Array.isArray(jsonResponse)).toBe(true);
            expect(jsonResponse).toHaveLength(0);
        });

        it('should return order objects with correct structure', async () => {
            const order = Order.create('user1', [{ productId: 'prod1', quantity: 1, price: 100 }]);
            await repository.create(order);

            const mockReq = {};
            let jsonResponse: any = null;

            const mockRes = {
                status: () => mockRes,
                json: (data: any) => {
                    jsonResponse = data;
                }
            };

            await controller.handle(mockReq as any, mockRes as any);

            expect(jsonResponse[0]).toBeDefined();
            expect(jsonResponse[0].id).toBe(order.id);
            expect(jsonResponse[0].status).toBe('pending');
            expect(jsonResponse[0].total).toBe(100);
            expect(jsonResponse[0].items).toBeDefined();
            expect(jsonResponse[0].createdAt).toBeDefined();
            expect(jsonResponse[0].updatedAt).toBeDefined();
        });

        it('should include userId in order response (orders returned as-is)', async () => {
            const order = Order.create('user1', [{ productId: 'prod1', quantity: 1, price: 100 }]);
            await repository.create(order);

            const mockReq = {};
            let jsonResponse: any = null;

            const mockRes = {
                status: () => mockRes,
                json: (data: any) => {
                    jsonResponse = data;
                }
            };

            await controller.handle(mockReq as any, mockRes as any);

            // GetAllOrderController returns raw orders, not getPublicData()
            expect(jsonResponse[0].userId).toBe('user1');
        });

        it('should handle multiple orders with different properties', async () => {
            const order1 = Order.create('user1', [{ productId: 'prod1', quantity: 1, price: 100 }]);
            const order2 = Order.create('user2', [
                { productId: 'prod2', quantity: 2, price: 50 },
                { productId: 'prod3', quantity: 1, price: 75 }
            ]);

            await repository.create(order1);
            await repository.create(order2);

            const mockReq = {};
            let jsonResponse: any = null;

            const mockRes = {
                status: () => mockRes,
                json: (data: any) => {
                    jsonResponse = data;
                }
            };

            await controller.handle(mockReq as any, mockRes as any);

            expect(jsonResponse).toHaveLength(2);
            expect(jsonResponse[0].total).toBe(100);
            expect(jsonResponse[1].total).toBe(175);
            expect(jsonResponse[0].items).toHaveLength(1);
            expect(jsonResponse[1].items).toHaveLength(2);
        });
    });
});