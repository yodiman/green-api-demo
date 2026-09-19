import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { notificationConfig } from '@/shared/api/green-api/notification-config'
import type { GreenApiSession } from '@/shared/api/green-api/session-context'
import { mapIncomingMessage } from '../model/message-mapper'
import type { ChatMessage } from '../model/types'
import { chatKeys } from './keys'

export function notificationQueryOptions(queryClient: QueryClient, session: GreenApiSession | null) {
  return queryOptions({
    queryKey: [...chatKeys.all, 'notifications'],
    enabled: Boolean(session),
    retry: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: true,
    refetchInterval: (query) => query.state.status === 'error'
      ? notificationConfig.pollingErrorDelayMs
      : notificationConfig.pollingDelayMs,
    queryFn: async ({ signal }) => {
      if (!session) {
        return null
      }

      const requestSignal = AbortSignal.any([signal, session.signal])
      const notification = await session.api.receiveNotification(requestSignal)

      if (!notification) {
        return null
      }

      const message = mapIncomingMessage(notification)

      if (message) {
        queryClient.setQueryData<ChatMessage[]>(chatKeys.messages(message.chatId), (current = []) =>
          current.some((item) => item.id === message.id) ? current : [...current, message])
      }

      await session.api.deleteNotification(notification.receiptId, requestSignal)

      return null
    },
  })
}

export function useNotificationPolling(session: GreenApiSession | null) {
  return useQuery(notificationQueryOptions(useQueryClient(), session))
}
