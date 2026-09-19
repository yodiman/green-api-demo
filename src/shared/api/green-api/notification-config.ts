import { z } from 'zod'

const receiveTimeoutSchema = z.coerce.number().int().min(5).max(60).catch(5)
const pollingDelaySchema = z.coerce.number().int().positive()

export const notificationConfig = {
  receiveTimeoutSeconds: receiveTimeoutSchema.parse(import.meta.env.VITE_GREEN_API_RECEIVE_TIMEOUT_SECONDS),
  pollingDelayMs: pollingDelaySchema.catch(1000).parse(import.meta.env.VITE_GREEN_API_POLLING_DELAY_MS),
  pollingErrorDelayMs: pollingDelaySchema.catch(2000).parse(import.meta.env.VITE_GREEN_API_POLLING_ERROR_DELAY_MS),
}
