import { useSession } from '@/features/session'
import { useChats } from '../../queries/use-chats'
import { useChatUi } from '../../store/chat-ui-store'
import { ChatList } from '../ChatList/ChatList'
import { Conversation } from '../Conversation/Conversation'
import { NewChatDialog } from '../NewChatDialog/NewChatDialog'
import styles from './ChatWorkspace.module.scss'

export function ChatWorkspace() {
  const { notificationError } = useSession()
  const { selectedChatId, isNewChatOpen, selectChat, setNewChatOpen } = useChatUi()
  const chats = useChats()
  const chatList = chats.data ?? []
  const selectedChat = chatList.find((chat) => chat.chatId === selectedChatId)

  function handleNewChat() {
    setNewChatOpen(true)
  }

  function handleBack() {
    selectChat(null)
  }

  function handleCloseDialog() {
    setNewChatOpen(false)
  }

  function handleChatCreated(chatId: string) {
    selectChat(chatId)
    setNewChatOpen(false)
  }

  return (
    <main className={styles.shell}>
      <ChatList chats={chatList}
        selectedChatId={selectedChatId}
        onSelect={selectChat}
        onNew={handleNewChat}
      />
      <Conversation
        key={selectedChatId ?? 'empty'}
        chat={selectedChat}
        onBack={handleBack}
      />

      {notificationError
        ? <div className={styles.notificationError} role="status">{notificationError}</div>
        : null
      }

      {isNewChatOpen
        ? <NewChatDialog onClose={handleCloseDialog}
          onCreated={handleChatCreated}
        />
        : null
      }
    </main>
  )
}
