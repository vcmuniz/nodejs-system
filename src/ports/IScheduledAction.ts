// Port - Interface para ações agendadas genéricas
export enum ScheduledActionType {
  WHATSAPP_MESSAGE = 'whatsapp_message',
  API_CALL = 'api_call',
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  CUSTOM = 'custom',
}

export interface ScheduledActionPayload {
  [key: string]: any;
}

export interface IScheduledAction {
  type: ScheduledActionType;
  execute(payload: ScheduledActionPayload): Promise<void>;
}

export interface IScheduledActionFactory {
  create(type: ScheduledActionType, payload: ScheduledActionPayload): IScheduledAction;
}
