import type { z } from 'zod'
import type { GreenApi, GreenApiCredentials } from './types'
import { ApiError } from './errors'
import { notificationConfig } from './notification-config'
import {
  checkAccountResponseSchema,
  deleteResponseSchema,
  receiveResponseSchema,
  sendMessageResponseSchema,
} from './schemas'

export class GreenApiClient implements GreenApi {
  private readonly fetcher: typeof fetch

  constructor(private readonly credentials: GreenApiCredentials, fetcher: typeof fetch = globalThis.fetch) {
    this.fetcher = fetcher.bind(globalThis)
  }

  private endpoint(method: string, suffix = ''): string {
    const { apiUrl, idInstance, apiTokenInstance } = this.credentials

    return `${apiUrl.replace(/\/$/, '')}/waInstance${idInstance}/${method}/${encodeURIComponent(apiTokenInstance)}${suffix}`
  }

  private async request<T>(method: string, schema: z.ZodType<T>, init: RequestInit = {}, suffix = ''): Promise<T> {
    let response: Response

    try {
      response = await this.fetcher(this.endpoint(method, suffix), {
        ...init,
        cache: 'no-store',
        headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
      })
    } catch (error) {
      if (init.signal?.aborted) {
        throw error
      }

      throw new ApiError('network')
    }

    if (!response.ok) {
      throw new ApiError('http', response.status)
    }

    let data: unknown

    try {
      const body = await response.text()

      data = body ? JSON.parse(body) : null
    } catch (error) {
      if (init.signal?.aborted) {
        throw error
      }

      throw new ApiError('invalid-response')
    }

    const parsed = schema.safeParse(data)

    if (!parsed.success) {
      throw new ApiError('invalid-response')
    }

    return parsed.data
  }

  checkAccount(phone: string, signal?: AbortSignal) {
    return this.request('checkAccount', checkAccountResponseSchema, {
      method: 'POST', body: JSON.stringify({ phoneNumber: Number(phone) }), signal,
    })
  }

  sendMessage(chatId: string, message: string, signal?: AbortSignal) {
    return this.request('sendMessage', sendMessageResponseSchema, {
      method: 'POST', body: JSON.stringify({ chatId, message }), signal,
    })
  }

  receiveNotification(signal?: AbortSignal) {
    return this.request('receiveNotification', receiveResponseSchema.nullable(),
      { method: 'GET', signal }, `?receiveTimeout=${notificationConfig.receiveTimeoutSeconds}`)
  }

  async deleteNotification(receiptId: number, signal?: AbortSignal): Promise<void> {
    const result = await this.request('deleteNotification', deleteResponseSchema,
      { method: 'DELETE', signal }, `/${receiptId}`)

    if (!result.result) {
      throw new ApiError('invalid-response')
    }
  }
}
