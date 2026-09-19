import styles from './ContactAvatar.module.scss'

type ContactAvatarProps = {
  phone: string
}

export function ContactAvatar({ phone }: ContactAvatarProps) {
  return <span className={styles.avatar} aria-hidden="true">{phone.slice(-2)}</span>
}
