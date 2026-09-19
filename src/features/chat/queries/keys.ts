export const chatKeys = {
  all: ['chat'] as const,
  list: () => [...chatKeys.all, 'list'] as const,
  account: (phone: string) => [...chatKeys.all, 'account', phone] as const,
  messages: (chatId: string) => [...chatKeys.all, 'messages', chatId] as const,
}
