import type { ChatMessage } from '../../model/types'
import styles from './MessageBubble.module.scss'

type MessageBubbleProps = {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const className = `${styles.message} ${message.direction === 'outgoing' ? styles.outgoing : styles.incoming}`
  const date = new Date(message.timestamp)
  const time = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const direction = message.direction === 'outgoing' ? 'Исходящее сообщение' : 'Входящее сообщение'

  return (
    <article className={className}>
      <span className={styles.visuallyHidden}>{direction}:</span>
      <span>{message.text}</span>
      <time dateTime={date.toISOString()}>
        {time}
        {message.direction === 'outgoing' ? <span aria-hidden="true"> ✓</span> : null}
        {message.direction === 'outgoing'
          ? <span className={styles.visuallyHidden}> Принято в очередь</span>
          : null
        }
      </time>
    </article>
  )
}
