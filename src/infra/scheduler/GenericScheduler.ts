// Scheduler - Genérico para qualquer tipo de ação
import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { ScheduledActionType } from '../../ports/IScheduledAction';
import { ScheduledActionFactory } from './ScheduledActionFactory';

export class GenericScheduler {
  private task: cron.ScheduledTask | null = null;

  constructor(
    private prisma: PrismaClient,
    private actionFactory: ScheduledActionFactory,
  ) {}

  start(): void {
    console.log('[GenericScheduler] Iniciando scheduler genérico...');

    this.task = cron.schedule('* * * * *', async () => {
      await this.processScheduled();
    });

    console.log('[GenericScheduler] ✅ Scheduler genérico iniciado (executa a cada minuto)');
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      console.log('[GenericScheduler] Scheduler genérico parado');
    }
  }

  private async processScheduled(): Promise<void> {
    try {
      const now = new Date();

      const pending = await this.prisma.scheduledTask.findMany({
        where: {
          status: 'pending',
          scheduledFor: { lte: now },
        },
        orderBy: { scheduledFor: 'asc' },
        take: 10,
      });

      if (pending.length === 0) return;

      console.log(
        `[GenericScheduler] ${new Date().toISOString()} - Processando ${pending.length} tarefas agendadas...`,
      );

      for (const task of pending) {
        await this.executeTask(task);
      }
    } catch (error) {
      console.error('[GenericScheduler] Erro ao processar tarefas:', error);
    }
  }

  private async executeTask(task: any): Promise<void> {
    try {
      console.log(
        `[GenericScheduler] Executando: ${task.id} (${task.actionType}) para ${task.userId}`,
      );

      // Marcar como processando
      await this.prisma.scheduledTask.update({
        where: { id: task.id },
        data: { status: 'processing' },
      });

      // Criar e executar ação
      const action = this.actionFactory.create(task.actionType as ScheduledActionType, task.payload);
      await action.execute(task.payload);

      // Marcar como concluída
      await this.prisma.scheduledTask.update({
        where: { id: task.id },
        data: {
          status: 'completed',
          executedAt: new Date(),
          result: { success: true },
        },
      });

      console.log(`[GenericScheduler] ✅ Concluída: ${task.id}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`[GenericScheduler] ❌ Erro ao executar ${task.id}: ${errorMsg}`);

      // Incrementar tentativas
      const newAttempts = task.attempts + 1;
      const shouldRetry = newAttempts < task.maxRetries;

      await this.prisma.scheduledTask.update({
        where: { id: task.id },
        data: {
          status: shouldRetry ? 'pending' : 'failed',
          attempts: newAttempts,
          error: errorMsg,
          scheduledFor: shouldRetry ? new Date(Date.now() + 5 * 60 * 1000) : task.scheduledFor, // Retry em 5 minutos
        },
      });
    }
  }
}
