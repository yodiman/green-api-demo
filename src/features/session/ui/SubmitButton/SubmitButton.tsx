import { useFormStatus } from 'react-dom'
import styles from './SubmitButton.module.scss'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      className={styles.button}
      disabled={pending}
      type="submit"
    >
      {pending ? 'Подключение…' : 'Подключиться'}
    </button>
  )
}
