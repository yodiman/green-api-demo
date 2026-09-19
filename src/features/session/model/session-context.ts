import { createContext, useContext } from 'react'
import type { Credentials } from './credentials.schema'

type SessionContextValue = {
  status: 'disconnected' | 'connecting' | 'connected'
  notificationError: string | null
  connect: (credentials: Credentials) => Promise<void>
  disconnect: () => Promise<void>
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession() {
  const session = useContext(SessionContext)

  if (!session) {
    throw new Error('SessionContext не подключён')
  }

  return session
}
