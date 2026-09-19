import { mutationOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { requireGreenApiSession, useGreenApiSession } from '@/shared/api/green-api/session-context'
import type { GreenApiSession } from '@/shared/api/green-api/session-context'
import type { Chat, ChatMessage } from '../model/types'
import { validateMessage } from '../model/validation'
import { chatKeys } from './keys'

export function sendMessageMutationOptions(client: QueryClient, session: GreenApiSession | null) {
  return mutationOptions({
    mutationKey: [...chatKeys.all, 'send'],
    mutationFn: async ({ chatId, text: input }: { chatId: string, text: string }) => {
      requireGreenApiSession(session)

      const text = validateMessage(input)

      if (!client.getQueryData<Chat[]>(chatKeys.list())?.some((chat) => chat.chatId === chatId)) {
        throw new Error('Сначала создайте чат')
      }

      const result = await session.api.sendMessage(chatId, text, session.signal)

      const message: ChatMessage = {
        id: result.idMessage,
        chatId,
        text,
        direction: 'outgoing',
        status: 'queued',
        timestamp: Date.now(),
      }

      client.setQueryData<ChatMessage[]>(chatKeys.messages(chatId), (current = []) =>
        current.some((item) => item.id === message.id) ? current : [...current, message])

      return message
    },
  })
}

export function useSendMessage() {
  return useMutation(sendMessageMutationOptions(useQueryClient(), useGreenApiSession()))
}
