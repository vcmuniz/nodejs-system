// Action - Chamar API externa ou interna
import axios from 'axios';
import { IScheduledAction, ScheduledActionPayload, ScheduledActionType } from '../../../ports/IScheduledAction';

export class ApiCallAction implements IScheduledAction {
  type = ScheduledActionType.API_CALL;

  async execute(payload: ScheduledActionPayload): Promise<void> {
    const { url, method = 'POST', headers = {}, data } = payload;

    if (!url) {
      throw new Error('URL é obrigatória para ApiCallAction');
    }

    console.log(`[ApiCallAction] Chamando ${method} ${url}`);

    try {
      const response = await axios({
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        data,
        timeout: 30000,
      });

      console.log(`[ApiCallAction] ✅ Sucesso: ${response.status}`);

      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`[ApiCallAction] ❌ Erro: ${msg}`);
      throw error;
    }
  }
}
