import type { MouseEvent } from 'react'
import { DisconnectButton } from '@/features/session'
import { IconButton } from '@/shared/ui/IconButton/IconButton'
import type { Chat } from '../../model/types'
import { ContactAvatar } from '../ContactAvatar/ContactAvatar'
import styles from './ChatList.module.scss'

type ChatListProps = {
  chats: Chat[]
  selectedChatId: string | null
  onSelect: (chatId: string) => void
  onNew: () => void
}

export function ChatList({ chats, selectedChatId, onSelect, onNew }: ChatListProps) {
  const className = `${styles.sidebar} ${selectedChatId ? styles.hiddenOnMobile : ''}`

  function handleSelect(event: MouseEvent<HTMLButtonElement>) {
    onSelect(event.currentTarget.value)
  }

  return (
    <aside className={className}>
      <header className={styles.header}>
        <div>
          <p className={styles.sectionLabel}>GREEN-API</p>
          <h1>Чаты</h1>
        </div>
        <div className={styles.actions}>
          <IconButton icon="plus"
            onClick={onNew}
            aria-label="Создать чат"
          />
          <div className={styles.mobileDisconnect}>
            <DisconnectButton />
          </div>
        </div>
      </header>
      <div className={styles.items}>
        {chats.length === 0 ? <p className={styles.empty}>Создайте первый чат по номеру телефона</p> : chats.map((chat) => (
          <button className={`${styles.item} ${chat.chatId === selectedChatId ? styles.selected : ''}`}
            key={chat.chatId}
            value={chat.chatId}
            onClick={handleSelect}
            type="button"
            aria-current={chat.chatId === selectedChatId ? 'page' : undefined}
          >
            <ContactAvatar phone={chat.phone} />
            <span className={styles.text}><strong>{chat.phone}</strong><small>Текстовый чат</small></span>
          </button>
        ))}
      </div>
    </aside>
  )
}
