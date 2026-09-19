import type { ReceiveNotification } from '@/shared/api/green-api/schemas'
import type { ChatMessage } from './types'

export function mapIncomingMessage(notification: ReceiveNotification): ChatMessage | null {
  const { body } = notification

  if (body.typeWebhook !== 'incomingMessageReceived' || body.messageData?.typeMessage !== 'textMessage') {
    return null
  }

  const chatId = body.senderData?.chatId
  const id = body.idMessage
  const text = body.messageData.textMessageData?.textMessage

  if (!chatId || !id || text === undefined || body.timestamp === undefined) {
    throw new Error('Входящее текстовое уведомление имеет неверный формат')
  }

  return {
    id,
    chatId,
    text,
    direction: 'incoming',
    status: 'received',
    timestamp: body.timestamp * 1000,
  }
}
