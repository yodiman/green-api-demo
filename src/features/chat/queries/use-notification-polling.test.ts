import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '@/app/query-client'
import type { ReceiveNotification } from '@/shared/api/green-api/schemas'
import type { GreenApiSession } from '@/shared/api/green-api/session-context'
import type { GreenApi } from '@/shared/api/green-api/types'
import type { ChatMessage } from '../model/types'
import { chatKeys } from './keys'
import { notificationQueryOptions } from './use-notification-polling'

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

function setup(notification: ReceiveNotification | null) {
  const api: GreenApi = {
    checkAccount: vi.fn(),
    sendMessage: vi.fn(),
    receiveNotification: vi.fn().mockResolvedValue(notification),
    deleteNotification: vi.fn().mockResolvedValue(undefined),
  }
  const client = createQueryClient()
  const session: GreenApiSession = { api, signal: new AbortController().signal }

  return { api, client, session }
}

describe('notification polling cycle', () => {
  it('treats an empty queue as a normal result', async () => {
    const { api, client, session } = setup(null)

    await expect(client.fetchQuery(notificationQueryOptions(client, session))).resolves.toBeNull()
    expect(api.deleteNotification).not.toHaveBeenCalled()
  })

  it('caches incoming text before acknowledging the notification', async () => {
    const { api, client, session } = setup(createTextNotification())

    vi.mocked(api.deleteNotification).mockImplementation(async () => {
      expect(client.getQueryData<ChatMessage[]>(chatKeys.messages('chat-1'))).toHaveLength(1)
    })

    await client.fetchQuery(notificationQueryOptions(client, session))

    expect(api.deleteNotification).toHaveBeenCalledWith(1, expect.any(AbortSignal))
    expect(client.getQueryData<ChatMessage[]>(chatKeys.messages('chat-1'))?.[0]).toMatchObject({
      id: 'message-1',
      text: 'Ответ',
      direction: 'incoming',
    })
  })

  it('acknowledges skipped event types without caching a message', async () => {
    const notification: ReceiveNotification = {
      receiptId: 2,
      body: { typeWebhook: 'stateInstanceChanged' },
    }
    const { api, client, session } = setup(notification)

    await client.fetchQuery(notificationQueryOptions(client, session))

    expect(api.deleteNotification).toHaveBeenCalledWith(2, expect.any(AbortSignal))
    expect(client.getQueriesData({ queryKey: chatKeys.all })).toEqual([
      [[...chatKeys.all, 'notifications'], null],
    ])
  })

  it('deduplicates a repeated incoming message', async () => {
    const { client, session } = setup(createTextNotification())
    const existing: ChatMessage = {
      id: 'message-1',
      chatId: 'chat-1',
      text: 'Ответ',
      direction: 'incoming',
      status: 'received',
      timestamp: 100000,
    }

    client.setQueryData(chatKeys.messages('chat-1'), [existing])

    await client.fetchQuery(notificationQueryOptions(client, session))

    expect(client.getQueryData<ChatMessage[]>(chatKeys.messages('chat-1'))).toEqual([existing])
  })

  it('does not acknowledge malformed text', async () => {
    const notification = createTextNotification()

    delete notification.body.senderData

    const { api, client, session } = setup(notification)

    await expect(client.fetchQuery(notificationQueryOptions(client, session))).rejects.toThrow('неверный формат')
    expect(api.deleteNotification).not.toHaveBeenCalled()
  })
})
