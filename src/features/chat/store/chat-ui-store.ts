import { create } from 'zustand'

type ChatUiState = {
  selectedChatId: string | null
  isNewChatOpen: boolean
  selectChat: (chatId: string | null) => void
  setNewChatOpen: (open: boolean) => void
  reset: () => void
}

export const useChatUi = create<ChatUiState>((set) => ({
  selectedChatId: null,
  isNewChatOpen: false,
  selectChat: (selectedChatId) => set({ selectedChatId }),
  setNewChatOpen: (isNewChatOpen) => set({ isNewChatOpen }),
  reset: () => set({ selectedChatId: null, isNewChatOpen: false }),
}))
