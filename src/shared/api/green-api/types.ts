import type { CheckAccountResponse, ReceiveNotification, SendMessageResponse } from './schemas'

export type GreenApiCredentials = {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export type GreenApi = {
  checkAccount(phone: string, signal?: AbortSignal): Promise<CheckAccountResponse>
  sendMessage(chatId: string, message: string, signal?: AbortSignal): Promise<SendMessageResponse>
  receiveNotification(signal?: AbortSignal): Promise<ReceiveNotification | null>
  deleteNotification(receiptId: number, signal?: AbortSignal): Promise<void>
}
