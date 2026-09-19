import { z } from 'zod'

export const credentialsSchema = z.object({
  apiUrl: z.url({ protocol: /^https$/ }).refine((value) => {
    const url = new URL(value)

    return !url.username && !url.password && !url.search && !url.hash && url.pathname === '/'
  }, 'Укажите корневой HTTPS-адрес API из кабинета GREEN-API'),
  idInstance: z.string().regex(/^\d+$/, 'Введите числовой ID инстанса'),
  apiTokenInstance: z.string().min(1, 'Введите токен инстанса'),
})

export type Credentials = z.infer<typeof credentialsSchema>
