import { IconButton } from '@/shared/ui/IconButton/IconButton'
import { useSession } from '../../model/session-context'

export function DisconnectButton() {
  const { disconnect } = useSession()

  function handleClick() {
    void disconnect()
  }

  return (
    <IconButton
      icon="log-out"
      onClick={handleClick}
      aria-label="Отключить"
    />
  )
}
