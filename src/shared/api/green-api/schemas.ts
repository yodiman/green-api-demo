import { z } from 'zod'

export const checkAccountResponseSchema = z.object({
  exist: z.boolean(),
  chatId: z.string(),
})

export const sendMessageResponseSchema = z.object({ idMessage: z.string().min(1) })

export const receiveResponseSchema = z.object({
  receiptId: z.number().int().nonnegative(),
  body: z.object({
    typeWebhook: z.string(),
    idMessage: z.string().optional(),
    timestamp: z.number().optional(),
    senderData: z.object({ chatId: z.string() }).optional(),
    messageData: z.object({
      typeMessage: z.string(),
      textMessageData: z.object({ textMessage: z.string() }).optional(),
    }).optional(),
  }),
})

export const deleteResponseSchema = z.object({ result: z.boolean() })
export type ReceiveNotification = z.infer<typeof receiveResponseSchema>
export type CheckAccountResponse = z.infer<typeof checkAccountResponseSchema>
export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>
