// Use Case - Agendar qualquer tipo de tarefa
import { PrismaClient } from '@prisma/client';
import { ScheduledActionType } from '../../ports/IScheduledAction';

export interface ScheduleTaskInput {
  userId: string;
  actionType: ScheduledActionType;
  payload: Record<string, any>;
  scheduledFor: Date;
}

export interface ScheduleTaskOutput {
  success: boolean;
  taskId?: string;
  scheduledFor?: string;
  error?: string;
}

export class ScheduleTask {
  constructor(private prisma: PrismaClient) {}

  async execute(input: ScheduleTaskInput): Promise<ScheduleTaskOutput> {
    try {
      this.validate(input);

      const task = await this.prisma.scheduledTask.create({
        data: {
          userId: input.userId,
          actionType: input.actionType,
          payload: input.payload,
          scheduledFor: input.scheduledFor,
          maxRetries: 3,
        },
      });

      return {
        success: true,
        taskId: task.id,
        scheduledFor: task.scheduledFor.toISOString(),
      };
    } catch (error) {
      console.error('Erro ao agendar tarefa:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  private validate(input: ScheduleTaskInput): void {
    if (!input.userId || !input.actionType || !input.payload) {
      throw new Error('userId, actionType e payload são obrigatórios');
    }

    const now = new Date();
    if (input.scheduledFor <= now) {
      throw new Error('Data de agendamento deve ser no futuro');
    }

    const maxDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    if (input.scheduledFor > maxDate) {
      throw new Error('Agendamento máximo é de 90 dias no futuro');
    }
  }
}
