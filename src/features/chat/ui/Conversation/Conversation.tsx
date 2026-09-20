import { useEffect, useRef, useState } from 'react'
import type { SyntheticEvent } from 'react'
import { DisconnectButton } from '@/features/session'
import { IconButton } from '@/shared/ui/IconButton/IconButton'
import type { Chat } from '../../model/types'
import { useMessages } from '../../queries/use-messages'
import { useSendMessage } from '../../queries/use-send-message'
import { ContactAvatar } from '../ContactAvatar/ContactAvatar'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { MessageTextarea } from '../MessageTextarea/MessageTextarea'
import styles from './Conversation.module.scss'

type ConversationProps = {
  chat: Chat | undefined
  onBack: () => void
}

export function Conversation({ chat, onBack }: ConversationProps) {
  const messages = useMessages(chat?.chatId ?? null)
  const messageList = messages.data ?? []
  const lastMessageId = messageList.at(-1)?.id
  const sendMessage = useSendMessage()
  const [text, setText] = useState('')
  const messagesRef = useRef<HTMLDivElement>(null)
  const className = `${styles.conversation} ${chat ? styles.activeOnMobile : ''}`

  useEffect(() => {
    const messagesElement = messagesRef.current

    if (!messagesElement || !lastMessageId) {
      return
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    messagesElement.scrollTo({
      top: messagesElement.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [lastMessageId])

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!chat || !text.trim() || sendMessage.isPending) {
      return
    }

    try {
      await sendMessage.mutateAsync({ chatId: chat.chatId, text })
      setText('')
    } catch {
      return
    }
  }

  return (
    <section className={className}>
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={onBack}
          type="button"
          aria-label="Вернуться к списку"
        >‹
        </button>
        <ContactAvatar phone={chat?.phone ?? '?'} />
        <div className={styles.contact}>
          <strong>{chat?.phone ?? 'Чат'}</strong>
          <small>{chat ? 'Текстовые сообщения' : 'Выберите чат'}</small>
        </div>
        <div className={styles.desktopDisconnect}>
          <DisconnectButton />
        </div>
      </header>

      {!chat ? (
        <div className={styles.noSelection}>Выберите чат или создайте новый</div>
      ) : (
        <>
          <div
            ref={messagesRef}
            className={styles.messages}
            role="log"
            aria-label="Сообщения"
            aria-live="polite"
            aria-relevant="additions"
            tabIndex={0}
          >
            <div className={styles.messageContent}>
              {messageList.length === 0
                ? <div className={styles.empty}><strong>Сообщений пока нет</strong><span>Напишите первое сообщение</span></div>
                : messageList.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
            </div>
          </div>
          <div className={styles.composerPanel}>
            <form className={styles.composer} onSubmit={handleSubmit}>
              <MessageTextarea value={text} onChange={setText} />
              <IconButton
                icon="arrow-up"
                disabled={sendMessage.isPending || !text.trim()}
                type="submit"
                aria-label="Отправить"
              />
            </form>
            {sendMessage.error ? <p className={styles.composerError} role="alert">{sendMessage.error.message}</p> : null}
          </div>
        </>
      )}
    </section>
  )
}
