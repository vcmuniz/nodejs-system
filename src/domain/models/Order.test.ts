import { describe, it, expect } from 'vitest';
import { Order, OrderItem } from './Order';

describe('Order Model', () => {
  describe('constructor', () => {
    it('should create an order with all properties', () => {
      const items: OrderItem[] = [
        { productId: 'prod1', quantity: 2, price: 100 },
        { productId: 'prod2', quantity: 1, price: 50 }
      ];
      const order = new Order('1', 'user1', 'pending', items, 250);

      expect(order.id).toBe('1');
      expect(order.userId).toBe('user1');
      expect(order.status).toBe('pending');
      expect(order.items).toEqual(items);
      expect(order.total).toBe(250);
      expect(order.createdAt).toBeInstanceOf(Date);
      expect(order.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('create', () => {
    it('should create order with pending status', () => {
      const items: OrderItem[] = [
        { productId: 'prod1', quantity: 1, price: 100 }
      ];
      const order = Order.create('user1', items);

      expect(order.status).toBe('pending');
    });

    it('should calculate total amount correctly', () => {
      const items: OrderItem[] = [
        { productId: 'prod1', quantity: 2, price: 100 },
        { productId: 'prod2', quantity: 1, price: 50 }
      ];
      const order = Order.create('user1', items);

      expect(order.total).toBe(250);
    });

    it('should calculate zero total for empty items', () => {
      const order = Order.create('user1', []);

      expect(order.total).toBe(0);
    });

    it('should generate unique ids', () => {
      const items: OrderItem[] = [
        { productId: 'prod1', quantity: 1, price: 100 }
      ];
      const order1 = Order.create('user1', items);
      const order2 = Order.create('user1', items);

      expect(order1.id).not.toBe(order2.id);
    });

    it('should set userId correctly', () => {
      const items: OrderItem[] = [
        { productId: 'prod1', quantity: 1, price: 100 }
      ];
      const order = Order.create('user123', items);

      expect(order.userId).toBe('user123');
    });
  });

  describe('getPublicData', () => {
    it('should return public order data', () => {
      const items: OrderItem[] = [
        { productId: 'prod1', quantity: 1, price: 100 }
      ];
      const order = new Order('1', 'user1', 'completed', items, 100);
      const publicData = order.getPublicData();

      expect(publicData).toEqual({
        id: '1',
        status: 'completed',
        total: 100,
        items: items,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      });
      expect(publicData).not.toHaveProperty('userId');
    });

    it('should not include userId in public data', () => {
      const items: OrderItem[] = [];
      const order = new Order('1', 'user1', 'pending', items, 0);
      const publicData = order.getPublicData();

      expect('userId' in publicData).toBe(false);
    });
  });

  describe('OrderItem', () => {
    it('should have productId, quantity, and price properties', () => {
      const item: OrderItem = {
        productId: 'prod1',
        quantity: 5,
        price: 29.99
      };

      expect(item.productId).toBe('prod1');
      expect(item.quantity).toBe(5);
      expect(item.price).toBe(29.99);
    });
  });
});
