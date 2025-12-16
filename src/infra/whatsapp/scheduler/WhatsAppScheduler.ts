// Scheduler - Cron job para processar agendamentos
import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { IEvolutionAPI } from '../../../ports/IEvolutionAPI';

export class WhatsAppScheduler {
  private task: cron.ScheduledTask | null = null;

  constructor(
    private prisma: PrismaClient,
    private evolutionAPI: IEvolutionAPI,
  ) {}

  /**
   * Inicia o cron job
   * Executa a cada minuto: * * * * *
   */
  start(): void {
    console.log('[WhatsAppScheduler] Iniciando scheduler...');

    // Executa a cada minuto
    this.task = cron.schedule('* * * * *', async () => {
      await this.processScheduled();
    });

    console.log('[WhatsAppScheduler] ✅ Scheduler iniciado (executa a cada minuto)');
  }

  /**
   * Para o cron job
   */
  stop(): void {
    if (this.task) {
      this.task.stop();
      console.log('[WhatsAppScheduler] Scheduler parado');
    }
  }

  /**
   * Processa mensagens agendadas
   */
  private async processScheduled(): Promise<void> {
    try {
      const now = new Date();

      // Busca mensagens agendadas para agora ou antes
      const pending = await this.prisma.scheduled_messages.findMany({
        where: {
          status: 'pending',
          scheduledFor: {
            lte: now,
          },
        },
        orderBy: { scheduledFor: 'asc' },
        take: 10, // Processa até 10 por ciclo
      });

      if (pending.length === 0) return;

      console.log(
        `[WhatsAppScheduler] ${new Date().toISOString()} - Processando ${pending.length} mensagens agendadas...`,
      );

      for (const scheduled of pending) {
        await this.sendScheduledMessage(scheduled);
      }
    } catch (error) {
      console.error('[WhatsAppScheduler] Erro ao processar agendamentos:', error);
    }
  }

  /**
   * Envia uma mensagem agendada
   */
  private async sendScheduledMessage(scheduled: any): Promise<void> {
    try {
      console.log(`[WhatsAppScheduler] Enviando: ${scheduled.id} para ${scheduled.phoneNumber}`);

      // Enviar via Evolution API
      const response = await this.evolutionAPI.sendMessage(scheduled.instanceName, {
        number: scheduled.phoneNumber,
        text: scheduled.message,
      });

      if (!response.key?.id) {
        throw new Error(response.error || 'Erro ao enviar mensagem');
      }

      // Marcar como enviado
      await this.prisma.scheduled_messages.update({
        where: { id: scheduled.id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          messageId: response.key.id,
        },
      });

      console.log(`[WhatsAppScheduler] ✅ Enviada com sucesso: ${scheduled.id}`);
    } catch (error) {
      // Registrar erro e marcar como failed
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`[WhatsAppScheduler] ❌ Erro ao enviar ${scheduled.id}: ${errorMsg}`);

      await this.prisma.scheduled_messages.update({
        where: { id: scheduled.id },
        data: {
          status: 'failed',
          error: errorMsg,
        },
      });
    }
  }
}
