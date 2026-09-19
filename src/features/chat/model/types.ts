export type Chat = {
  chatId: string
  phone: string
}

export type ChatMessage = {
  id: string
  chatId: string
  text: string
  direction: 'incoming' | 'outgoing'
  status: 'received' | 'queued'
  timestamp: number
}
