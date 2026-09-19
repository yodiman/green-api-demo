import { skipToken, useQuery } from '@tanstack/react-query'
import type { ChatMessage } from '../model/types'
import { chatKeys } from './keys'

export function useMessages(chatId: string | null) {
  return useQuery<ChatMessage[]>({
    queryKey: chatKeys.messages(chatId ?? ''),
    queryFn: skipToken,
    initialData: [],
  })
}
