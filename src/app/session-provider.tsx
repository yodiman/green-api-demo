import { useCallback, useEffect, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { chatKeys, useChatUi, useNotificationPolling } from '@/features/chat'
import { credentialsSchema, SessionContext } from '@/features/session'
import type { Credentials } from '@/features/session'
import { GreenApiClient } from '@/shared/api/green-api/client'
import { GreenApiSessionContext } from '@/shared/api/green-api/session-context'
import type { GreenApiSession } from '@/shared/api/green-api/session-context'

export function SessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const resetChatUi = useChatUi((state) => state.reset)
  const controller = useRef<AbortController | null>(null)
  const [session, setSession] = useState<GreenApiSession | null>(null)
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const notifications = useNotificationPolling(session)

  const stopSession = useCallback(async () => {
    controller.current?.abort()
    controller.current = null

    await queryClient.cancelQueries({ queryKey: chatKeys.all })
    queryClient.removeQueries({ queryKey: chatKeys.all })
    resetChatUi()
    setSession(null)
  }, [queryClient, resetChatUi])

  const disconnect = useCallback(async () => {
    await stopSession()
    setStatus('disconnected')
  }, [stopSession])

  const connect = useCallback(async (input: Credentials) => {
    const credentials = credentialsSchema.safeParse(input)

    if (!credentials.success) {
      throw new Error('Проверьте apiUrl, ID и токен инстанса')
    }

    await stopSession()
    setStatus('connecting')

    const nextController = new AbortController()

    controller.current = nextController
    setSession({ api: new GreenApiClient(credentials.data), signal: nextController.signal })
    setStatus('connected')
  }, [stopSession])

  useEffect(() => () => controller.current?.abort(), [])

  const notificationError = notifications.error
    ? 'Не удалось получить или подтвердить уведомление GREEN-API. Повторяем запрос.'
    : null

  return (
    <SessionContext.Provider value={{ status, notificationError, connect, disconnect }}>
      <GreenApiSessionContext.Provider value={session}>
        {children}
      </GreenApiSessionContext.Provider>
    </SessionContext.Provider>
  )
}
