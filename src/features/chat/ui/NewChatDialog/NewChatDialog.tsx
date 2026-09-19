import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, MouseEvent, SyntheticEvent } from 'react'
import { useCreateChat } from '../../queries/use-create-chat'
import styles from './NewChatDialog.module.scss'

type NewChatDialogProps = {
  onClose: () => void
  onCreated: (chatId: string) => void
}

function maskPhoneInput(input: string) {
  return input
    .replace(/[^\d\s()+-]/g, '')
    .replace(/(?!^)\+/g, '')
}

export function NewChatDialog({ onClose, onCreated }: NewChatDialogProps) {
  const createChat = useCreateChat()
  const [phone, setPhone] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    dialog.showModal()

    return () => {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [])

  function handleBackdropMouseDown(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault()
    onClose()
  }

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    setPhone(maskPhoneInput(event.target.value))
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      const chat = await createChat.mutateAsync(phone)

      onCreated(chat.chatId)
    } catch {
      phoneInputRef.current?.focus()

      return
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.backdrop}
      aria-labelledby="new-chat-title"
      aria-describedby="new-chat-description"
      onCancel={handleCancel}
      onMouseDown={handleBackdropMouseDown}
    >
      <form className={styles.dialog}
        onSubmit={handleSubmit}
      >
        <h2 id="new-chat-title">Новый чат</h2>
        <p id="new-chat-description">Введите номер получателя с кодом +7 или +375.</p>
        <label htmlFor="new-chat-phone">Номер телефона</label>
        <input autoFocus
          ref={phoneInputRef}
          id="new-chat-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={24}
          value={phone}
          onChange={handlePhoneChange}
          placeholder="+7 999 123-45-67"
          aria-invalid={Boolean(createChat.error)}
          aria-describedby={createChat.error ? 'new-chat-description new-chat-phone-error' : 'new-chat-description'}
        />
        {createChat.error ? (
          <p
            className={styles.error}
            id="new-chat-phone-error"
            role="alert"
          >{createChat.error.message}
          </p>
        ) : null}
        <div className={styles.actions}>
          <button onClick={onClose} type="button">Отмена</button>
          <button className={styles.primaryButton}
            disabled={createChat.isPending}
            type="submit"
          >{createChat.isPending ? 'Проверка…' : 'Создать'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
