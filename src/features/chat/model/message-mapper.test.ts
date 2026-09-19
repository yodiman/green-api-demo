import { describe, expect, it } from 'vitest'
import type { ReceiveNotification } from '@/shared/api/green-api/schemas'
import { mapIncomingMessage } from './message-mapper'

function createTextNotification(): ReceiveNotification {
  return {
    receiptId: 1,
    body: {
      typeWebhook: 'incomingMessageReceived',
      idMessage: 'message-1',
      timestamp: 100,
      senderData: { chatId: 'chat-1' },
      messageData: {
        typeMessage: 'textMessage',
        textMessageData: { textMessage: 'Ответ' },
      },
    },
  }
}

describe('incoming message mapping', () => {
  it('maps text to the correct chat and converts seconds to milliseconds', () => {
    expect(mapIncomingMessage(createTextNotification())).toEqual({
      id: 'message-1',
      chatId: 'chat-1',
      text: 'Ответ',
      direction: 'incoming',
      status: 'received',
      timestamp: 100000,
    })
  })

  it('skips a non-text notification', () => {
    const notification = createTextNotification()

    notification.body.messageData = { typeMessage: 'imageMessage' }

    expect(mapIncomingMessage(notification)).toBeNull()
  })

  it('rejects malformed text to prevent acknowledging lost content', () => {
    const notification = createTextNotification()

    delete notification.body.senderData

    expect(() => mapIncomingMessage(notification)).toThrow('неверный формат')
  })
})
