import { beforeEach, describe, expect, it } from 'vitest';
import { Order } from '../../../domain/models/Order';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { makeOrderRepository } from '../../../infra/database/factories/makeOrderRepository';
import { UpdateOrder } from '../../../usercase/order/UpdateOrder';
import { UpdateOrderController } from './UpdateOrderController';

describe('UpdateOrderController - Unit Tests', () => {
  let controller: UpdateOrderController;
  let updateOrderUseCase: UpdateOrder;
  let repository: IOrderRepository;

  beforeEach(() => {
    repository = makeOrderRepository();
    updateOrderUseCase = new UpdateOrder(repository);
    controller = new UpdateOrderController(updateOrderUseCase);
  });

  describe('handle', () => {
    it('should update order successfully', async () => {
      const order = Order.create('user1', [{ productId: 'prod1', quantity: 1, price: 100 }]);
      await repository.create(order);

      const mockReq = {
        params: { id: order.id },
        body: { status: 'shipped' },
        userId: 'user1'
      };

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
      expect(jsonResponse.message).toBe('Order updated successfully');
      expect(jsonResponse.order.status).toBe('shipped');
    });

    it('should validate id presence', async () => {
      const mockReq = {
        params: {},
        body: { status: 'shipped' },
        userId: 'user1'
      };

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

      expect(statusCode).toBe(400);
      expect(jsonResponse.error).toContain('Missing required field');
    });

    it('should return 404 when order not found', async () => {
      const mockReq = {
        params: { id: 'nonexistent' },
        body: { status: 'shipped' },
        userId: 'user1'
      };

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

      expect(statusCode).toBe(404);
      expect(jsonResponse.error).toBe('Order not found');
    });

    it('should update order status', async () => {
      const order = Order.create('user1', [{ productId: 'prod1', quantity: 1, price: 100 }]);
      await repository.create(order);

      const mockReq = {
        params: { id: order.id },
        body: { status: 'completed' },
        userId: 'user1'
      };

      let jsonResponse: any = null;

      const mockRes = {
        status: () => mockRes,
        json: (data: any) => {
          jsonResponse = data;
        }
      };

      await controller.handle(mockReq as any, mockRes as any);

      expect(jsonResponse.order.status).toBe('completed');
    });

    it('should preserve total when updating status', async () => {
      const order = Order.create('user1', [
        { productId: 'prod1', quantity: 2, price: 50 }
      ]);
      await repository.create(order);

      const mockReq = {
        params: { id: order.id },
        body: { status: 'shipped' },
        userId: 'user1'
      };

      let jsonResponse: any = null;

      const mockRes = {
        status: () => mockRes,
        json: (data: any) => {
          jsonResponse = data;
        }
      };

      await controller.handle(mockReq as any, mockRes as any);

      expect(jsonResponse.order.total).toBe(100);
    });

    it('should return order public data', async () => {
      const order = Order.create('user1', [{ productId: 'prod1', quantity: 1, price: 100 }]);
      await repository.create(order);

      const mockReq = {
        params: { id: order.id },
        body: { status: 'shipped' },
        userId: 'user1'
      };

      let jsonResponse: any = null;

      const mockRes = {
        status: () => mockRes,
        json: (data: any) => {
          jsonResponse = data;
        }
      };

      await controller.handle(mockReq as any, mockRes as any);

      expect('userId' in jsonResponse.order).toBe(false);
      expect(jsonResponse.order.id).toBe(order.id);
    });
  });
});
