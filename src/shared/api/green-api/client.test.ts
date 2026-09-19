import { describe, expect, it, vi } from 'vitest'
import { GreenApiClient } from './client'

const credentials = {
  apiUrl: 'https://example.api.green-api.com/', idInstance: '123456', apiTokenInstance: 'secret',
}

describe('GREEN-API transport', () => {
  it('uses the instance apiUrl and validates the response', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ exist: true, chatId: '42' }), { status: 200 }))
    const api = new GreenApiClient(credentials, fetcher)

    await expect(api.checkAccount('79991234567')).resolves.toEqual({ exist: true, chatId: '42' })
    expect(fetcher.mock.calls[0][0]).toBe('https://example.api.green-api.com/waInstance123456/checkAccount/secret')
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ phoneNumber: 79991234567 })
  })

  it('treats empty receive response as a timeout and maps HTTP errors safely', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 200 }))
      .mockResolvedValueOnce(new Response('private response', { status: 403 }))
    const api = new GreenApiClient(credentials, fetcher)

    await expect(api.receiveNotification()).resolves.toBeNull()
    await expect(api.sendMessage('42', 'Hello')).rejects.toMatchObject({ kind: 'http', status: 403 })
  })
})
