import { z } from 'zod'

export const phoneSchema = z.string().trim().transform((input) => {
  return input.replace(/[\s()+-]/g, '')
}).pipe(z.string().regex(/^(?:7\d{10}|375\d{9})$/))

export const messageSchema = z.string().trim().min(1).max(4000)

export function normalizePhone(input: string): string {
  const result = phoneSchema.safeParse(input)

  if (!result.success) {
    throw new Error('Введите поддерживаемый номер с кодом 7 или 375')
  }

  return result.data
}

export function validateMessage(input: string): string {
  const result = messageSchema.safeParse(input)

  if (!result.success) {
    throw new Error('Сообщение должно содержать от 1 до 4000 символов')
  }

  return result.data
}
