import { skipToken, useQuery } from '@tanstack/react-query'
import type { Chat } from '../model/types'
import { chatKeys } from './keys'

export function useChats() {
  return useQuery<Chat[]>({
    queryKey: chatKeys.list(),
    queryFn: skipToken,
    initialData: [],
  })
}
