import { describe, expect, it } from 'vitest'
import { normalizePhone, validateMessage } from './validation'

describe('chat input validation', () => {
  it.each([
    ['+7 (999) 123-45-67', '79991234567'],
    ['+375 (29) 123-45-67', '375291234567'],
  ])('normalizes a supported phone number', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
  })

  it.each(['89991234567', '7999123456', '+12345678901', 'phone'])('rejects an unsupported phone number', (input) => {
    expect(() => normalizePhone(input)).toThrow('Введите поддерживаемый номер')
  })

  it('trims a valid message', () => {
    expect(validateMessage('  Привет  ')).toBe('Привет')
  })

  it.each(['   ', 'a'.repeat(4001)])('rejects an invalid message', (input) => {
    expect(() => validateMessage(input)).toThrow('Сообщение должно содержать')
  })
})
