import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryOrderRepository } from './MemoryOrderRepository';
import { Order, OrderItem } from '../../../../../domain/models/Order';

describe('MemoryOrderRepository', () => {
  let repository: MemoryOrderRepository;
  let testOrder: Order;
  let testItems: OrderItem[];

  beforeEach(() => {
    repository = new MemoryOrderRepository();
    testItems = [
      { productId: 'prod1', quantity: 2, price: 100 },
      { productId: 'prod2', quantity: 1, price: 50 }
    ];
    testOrder = new Order('1', 'user1', 'pending', testItems, 250);
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const result = await repository.create(testOrder);

      expect(result).toEqual(testOrder);
    });

    it('should store the order in memory', async () => {
      await repository.create(testOrder);
      const found = await repository.findById('1');

      expect(found).toEqual(testOrder);
    });

    it('should create multiple orders', async () => {
      const order2 = new Order('2', 'user2', 'completed', testItems, 250);

      await repository.create(testOrder);
      await repository.create(order2);

      const all = await repository.findAll();
      expect(all).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should find order by id', async () => {
      await repository.create(testOrder);
      const result = await repository.findById('1');

      expect(result).toEqual(testOrder);
    });

    it('should return null when order not found', async () => {
      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const order2 = new Order('2', 'user2', 'completed', testItems, 250);

      await repository.create(testOrder);
      await repository.create(order2);

      const all = await repository.findAll();

      expect(all).toHaveLength(2);
    });

    it('should return empty array when no orders exist', async () => {
      const all = await repository.findAll();

      expect(all).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update order status', async () => {
      await repository.create(testOrder);
      const result = await repository.update('1', { status: 'completed' });

      expect(result).not.toBeNull();
      expect(result?.status).toBe('completed');
    });

    it('should update order items', async () => {
      await repository.create(testOrder);
      const newItems: OrderItem[] = [
        { productId: 'prod3', quantity: 1, price: 75 }
      ];
      const result = await repository.update('1', { items: newItems });

      expect(result?.items).toEqual(newItems);
    });

    it('should update order total', async () => {
      await repository.create(testOrder);
      const result = await repository.update('1', { total: 500 });

      expect(result?.total).toBe(500);
    });

    it('should update updatedAt timestamp', async () => {
      await repository.create(testOrder);
      const originalUpdatedAt = testOrder.updatedAt;
      
      await new Promise(resolve => setTimeout(resolve, 10));
      const result = await repository.update('1', { status: 'shipped' });

      expect(result?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should return null when order not found', async () => {
      const result = await repository.update('nonexistent', { status: 'completed' });

      expect(result).toBeNull();
    });

    it('should preserve userId when updating', async () => {
      await repository.create(testOrder);
      await repository.update('1', { status: 'shipped' });
      const result = await repository.findById('1');

      expect(result?.userId).toBe('user1');
    });

    it('should preserve createdAt when updating', async () => {
      await repository.create(testOrder);
      const originalCreatedAt = testOrder.createdAt;
      
      await repository.update('1', { status: 'shipped' });
      const result = await repository.findById('1');

      expect(result?.createdAt).toEqual(originalCreatedAt);
    });
  });
});
