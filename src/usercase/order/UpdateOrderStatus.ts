import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { IUseCase } from '../IUseCase';

export interface UpdateOrderStatusInput {
  userId: string;
  orderId: string;
  status: 'DRAFT' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}

export class UpdateOrderStatus implements IUseCase<UpdateOrderStatusInput, any> {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(input: UpdateOrderStatusInput): Promise<any> {
    const order = await this.orderRepository.findById(input.orderId, input.userId);
    if (!order) {
      throw new Error('Order not found');
    }

    return this.orderRepository.updateStatus(input.orderId, input.userId, input.status);
  }
}
