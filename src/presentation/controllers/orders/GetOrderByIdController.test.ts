import { describe, it, expect, beforeEach } from 'vitest';
import { GetOrderByIdController } from './GetOrderByIdController';
import { Order } from '../../../domain/models/Order';
import { GetOrderById } from '../../../usercase/order/GetOrderById';
import { MemoryOrderRepository } from '../../../infra/database/factories/repositories/memory/MemoryOrderRepository';

describe('GetOrderByIdController - Unit Tests', () => {
  let controller: GetOrderByIdController;
  let getOrderByIdUseCase: GetOrderById;
  let repository: MemoryOrderRepository;

  beforeEach(() => {
    repository = new MemoryOrderRepository();
    getOrderByIdUseCase = new GetOrderById(repository);
    controller = new GetOrderByIdController(getOrderByIdUseCase);
  });

  describe('handle', () => {
    it('should retrieve order by id successfully', async () => {
      const order = Order.create('user1', [{ productId: 'prod1', quantity: 1, price: 100 }]);
      await repository.create(order);

      const mockReq = {
        params: { id: order.id },
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
      expect(jsonResponse).toBeDefined();
      expect(jsonResponse.id).toBe(order.id);
    });

    it('should validate id presence', async () => {
      const mockReq = {
        params: {},
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

    it('should return order public data without userId', async () => {
      const order = Order.create('user1', [{ productId: 'prod1', quantity: 1, price: 100 }]);
      await repository.create(order);

      const mockReq = {
        params: { id: order.id },
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

      expect('userId' in jsonResponse).toBe(false);
      expect(jsonResponse.id).toBe(order.id);
      expect(jsonResponse.status).toBe('pending');
    });

    it('should include order total in response', async () => {
      const order = Order.create('user1', [
        { productId: 'prod1', quantity: 2, price: 50 },
        { productId: 'prod2', quantity: 3, price: 30 }
      ]);
      await repository.create(order);

      const mockReq = {
        params: { id: order.id },
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

      expect(jsonResponse.total).toBe(190);
    });

    it('should include order items in response', async () => {
      const items = [
        { productId: 'prod1', quantity: 1, price: 100 }
      ];
      const order = Order.create('user1', items);
      await repository.create(order);

      const mockReq = {
        params: { id: order.id },
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

      expect(jsonResponse.items).toEqual(items);
    });
  });
});
