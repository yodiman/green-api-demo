import { ChatWorkspace } from '@/features/chat'
import { ConnectionForm, useSession } from '@/features/session'
import styles from './app.module.scss'

export function App() {
  const { status } = useSession()

  return (
    <div className={styles.app}>
      {status === 'connected' ? <ChatWorkspace /> : <ConnectionForm />}
    </div>
  )
}
