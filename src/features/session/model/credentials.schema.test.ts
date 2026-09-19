import { describe, expect, it } from 'vitest'
import { credentialsSchema } from './credentials.schema'

const credentials = {
  apiUrl: 'https://example.api.green-api.com',
  idInstance: '123456',
  apiTokenInstance: 'secret',
}

describe('credentials validation', () => {
  it('accepts valid GREEN-API credentials', () => {
    expect(credentialsSchema.safeParse(credentials).success).toBe(true)
  })

  it.each([
    { ...credentials, apiUrl: 'http://example.api.green-api.com' },
    { ...credentials, apiUrl: 'https://user:password@example.api.green-api.com' },
    { ...credentials, apiUrl: 'https://example.api.green-api.com/path' },
    { ...credentials, idInstance: 'instance' },
    { ...credentials, apiTokenInstance: '' },
  ])('rejects unsafe or incomplete credentials', (input) => {
    expect(credentialsSchema.safeParse(input).success).toBe(false)
  })
})
