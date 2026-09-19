import { MutationObserver } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '@/app/query-client'
import type { GreenApiSession } from '@/shared/api/green-api/session-context'
import type { GreenApi } from '@/shared/api/green-api/types'
import type { Chat, ChatMessage } from '../model/types'
import { chatKeys } from './keys'
import { createChatMutationOptions } from './use-create-chat'
import { sendMessageMutationOptions } from './use-send-message'

function setup() {
  const api: GreenApi = {
    checkAccount: vi.fn().mockResolvedValue({ exist: true, chatId: 'chat-1' }),
    sendMessage: vi.fn().mockResolvedValue({ idMessage: 'message-1' }),
    receiveNotification: vi.fn().mockResolvedValue(null),
    deleteNotification: vi.fn().mockResolvedValue(undefined),
  }
  const client = createQueryClient()
  const controller = new AbortController()
  const session: GreenApiSession = { api, signal: controller.signal }

  return { api, client, session }
}

describe('chat creation', () => {
  it('normalizes a phone, checks the account and caches the chat', async () => {
    const { api, client, session } = setup()
    const mutation = new MutationObserver(client, createChatMutationOptions(client, session))

    await expect(mutation.mutate('+7 (999) 123-45-67')).resolves.toEqual({
      chatId: 'chat-1',
      phone: '79991234567',
    })
    expect(api.checkAccount).toHaveBeenCalledWith('79991234567', expect.any(AbortSignal))
    expect(client.getQueryData(chatKeys.list())).toEqual([{ chatId: 'chat-1', phone: '79991234567' }])
  })

  it('returns an existing chat without another API request', async () => {
    const { api, client, session } = setup()
    const existing = { chatId: 'chat-1', phone: '79991234567' }

    client.setQueryData<Chat[]>(chatKeys.list(), [existing])

    const mutation = new MutationObserver(client, createChatMutationOptions(client, session))

    await expect(mutation.mutate('+7 999 123-45-67')).resolves.toEqual(existing)
    expect(api.checkAccount).not.toHaveBeenCalled()
  })

  it('does not cache a phone without a MAX account', async () => {
    const { api, client, session } = setup()

    vi.mocked(api.checkAccount).mockResolvedValue({ exist: false, chatId: '' })

    const mutation = new MutationObserver(client, createChatMutationOptions(client, session))

    await expect(mutation.mutate('79991234567')).rejects.toThrow('не найден аккаунт MAX')
    expect(client.getQueryData(chatKeys.list())).toBeUndefined()
  })

  it('deduplicates concurrent checks and chat cache entries', async () => {
    const { api, client, session } = setup()
    let resolveAccount!: (value: { exist: boolean, chatId: string }) => void

    vi.mocked(api.checkAccount).mockImplementation(() => new Promise((resolve) => {
      resolveAccount = resolve
    }))

    const firstMutation = new MutationObserver(client, createChatMutationOptions(client, session))
    const secondMutation = new MutationObserver(client, createChatMutationOptions(client, session))
    const first = firstMutation.mutate('79991234567')
    const second = secondMutation.mutate('+7 999 123-45-67')

    await vi.waitFor(() => expect(api.checkAccount).toHaveBeenCalledTimes(1))
    resolveAccount({ exist: true, chatId: 'chat-1' })
    await Promise.all([first, second])

    expect(client.getQueryData<Chat[]>(chatKeys.list())).toEqual([
      { chatId: 'chat-1', phone: '79991234567' },
    ])
  })
})

describe('message sending', () => {
  it('sends trimmed text and caches an outgoing message', async () => {
    const { api, client, session } = setup()

    client.setQueryData<Chat[]>(chatKeys.list(), [{ chatId: 'chat-1', phone: '79991234567' }])

    const mutation = new MutationObserver(client, sendMessageMutationOptions(client, session))
    const message = await mutation.mutate({ chatId: 'chat-1', text: '  Привет  ' })

    expect(api.sendMessage).toHaveBeenCalledWith('chat-1', 'Привет', session.signal)
    expect(message).toMatchObject({
      id: 'message-1',
      chatId: 'chat-1',
      text: 'Привет',
      direction: 'outgoing',
      status: 'queued',
    })
    expect(client.getQueryData<ChatMessage[]>(chatKeys.messages('chat-1'))).toEqual([message])
  })

  it('rejects an unknown chat before the API request', async () => {
    const { api, client, session } = setup()
    const mutation = new MutationObserver(client, sendMessageMutationOptions(client, session))

    await expect(mutation.mutate({ chatId: 'missing', text: 'Привет' })).rejects.toThrow('Сначала создайте чат')
    expect(api.sendMessage).not.toHaveBeenCalled()
  })

  it('does not duplicate the same outgoing message in cache', async () => {
    const { client, session } = setup()

    client.setQueryData<Chat[]>(chatKeys.list(), [{ chatId: 'chat-1', phone: '79991234567' }])

    const firstMutation = new MutationObserver(client, sendMessageMutationOptions(client, session))
    const secondMutation = new MutationObserver(client, sendMessageMutationOptions(client, session))

    await firstMutation.mutate({ chatId: 'chat-1', text: 'Привет' })
    await secondMutation.mutate({ chatId: 'chat-1', text: 'Ещё раз' })

    expect(client.getQueryData<ChatMessage[]>(chatKeys.messages('chat-1'))).toHaveLength(1)
  })
})
