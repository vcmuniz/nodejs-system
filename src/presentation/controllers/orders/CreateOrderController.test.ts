import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateOrderController } from './CreateOrderController';
import { OrderItem } from '../../../domain/models/Order';
import { CreateOrder } from '../../../usercase/order/CreateOrder';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { makeOrderRepository } from '../../../infra/database/factories/makeOrderRepository';

describe('CreateOrderController - Unit Tests', () => {
  let controller: CreateOrderController;
  let createOrderUseCase: CreateOrder;
  let repository: IOrderRepository;

  beforeEach(() => {
    repository = makeOrderRepository();
    createOrderUseCase = new CreateOrder(repository);
    controller = new CreateOrderController(createOrderUseCase);
  });

  describe('handle', () => {
    it('should create order successfully with status 201', async () => {
      const mockReq = {
        body: {
          items: [
            { productId: 'prod1', quantity: 2, price: 100 },
            { productId: 'prod2', quantity: 1, price: 50 }
          ]
        },
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

      expect(statusCode).toBe(201);
      expect(jsonResponse.message).toBe('Order created successfully');
      expect(jsonResponse.order).toBeDefined();
      expect(jsonResponse.order.total).toBe(250);
    });

    it('should validate items presence', async () => {
      const mockReq = {
        body: {},
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
      expect(jsonResponse.error).toContain('Missing required fields');
    });

    it('should return order public data without userId', async () => {
      const mockReq = {
        body: {
          items: [{ productId: 'prod1', quantity: 1, price: 100 }]
        },
        userId: 'secret-user-id'
      };

      let jsonResponse: any = null;

      const mockRes = {
        status: () => mockRes,
        json: (data: any) => {
          jsonResponse = data;
        }
      };

      await controller.handle(mockReq as any, mockRes as any);

      expect(jsonResponse.order).toBeDefined();
      expect('userId' in jsonResponse.order).toBe(false);
    });

    it('should handle multiple items correctly', async () => {
      const items: OrderItem[] = [
        { productId: 'prod1', quantity: 3, price: 50 },
        { productId: 'prod2', quantity: 2, price: 75 },
        { productId: 'prod3', quantity: 1, price: 100 }
      ];

      const mockReq = {
        body: { items },
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

      expect(jsonResponse.order.total).toBe(400);
      expect(jsonResponse.order.items).toHaveLength(3);
    });
  });
});
