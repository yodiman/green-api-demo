import { mutationOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { requireGreenApiSession, useGreenApiSession } from '@/shared/api/green-api/session-context'
import type { GreenApiSession } from '@/shared/api/green-api/session-context'
import type { Chat } from '../model/types'
import { normalizePhone } from '../model/validation'
import { chatKeys } from './keys'

export function createChatMutationOptions(client: QueryClient, session: GreenApiSession | null) {
  return mutationOptions({
    mutationKey: [...chatKeys.all, 'create'],
    mutationFn: async (input: string) => {
      requireGreenApiSession(session)

      const phone = normalizePhone(input)
      const existing = client.getQueryData<Chat[]>(chatKeys.list())?.find((chat) => chat.phone === phone)

      if (existing) {
        return existing
      }

      // Query cache deduplicates concurrent checks for the same normalized phone.
      const account = await client.query({
        queryKey: chatKeys.account(phone),
        queryFn: ({ signal }) => session.api.checkAccount(phone, AbortSignal.any([signal, session.signal])),
      })

      if (!account.exist || !account.chatId) {
        throw new Error('На этом номере не найден аккаунт MAX')
      }

      const chat = { chatId: account.chatId, phone }

      client.setQueryData<Chat[]>(chatKeys.list(), (current = []) =>
        current.some((item) => item.phone === phone) ? current : [...current, chat])

      return chat
    },
  })
}

export function useCreateChat() {
  return useMutation(createChatMutationOptions(useQueryClient(), useGreenApiSession()))
}
