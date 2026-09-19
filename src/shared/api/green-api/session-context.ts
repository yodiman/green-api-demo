import { createContext, useContext } from 'react'
import type { GreenApi } from './types'

export type GreenApiSession = {
  api: GreenApi
  signal: AbortSignal
}

export const GreenApiSessionContext = createContext<GreenApiSession | null>(null)

export function useGreenApiSession() {
  return useContext(GreenApiSessionContext)
}

export function requireGreenApiSession(session: GreenApiSession | null): asserts session is GreenApiSession {
  if (!session || session.signal.aborted) {
    throw new Error('Сессия завершена. Подключите инстанс заново.')
  }
}
