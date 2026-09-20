import { useLayoutEffect, useRef } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import styles from './MessageTextarea.module.scss'

type MessageTextareaProps = {
  value: string
  onChange: (value: string) => void
}

const maxHeight = 150

function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
  const isSubmitShortcut = event.key === 'Enter' && (event.metaKey || event.ctrlKey)

  if (!isSubmitShortcut || event.nativeEvent.isComposing) {
    return
  }

  event.preventDefault()
  event.currentTarget.form?.requestSubmit()
}

export function MessageTextarea({ value, onChange }: MessageTextareaProps) {
  const textarea = useRef<HTMLTextAreaElement>(null)

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value)
  }

  useLayoutEffect(() => {
    const element = textarea.current

    if (!element) {
      return
    }

    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`
    element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [value])

  return (
    <textarea
      className={styles.textarea}
      ref={textarea}
      id="chat-message"
      name="message"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="Сообщение"
      aria-label="Сообщение"
      rows={1}
    />
  )
}
