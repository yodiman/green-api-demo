import type { ButtonHTMLAttributes } from 'react'
import styles from './IconButton.module.scss'

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: 'plus' | 'arrow-up' | 'log-out'
  'aria-label': string
}

const iconPaths = {
  plus: 'M12 5v14M5 12h14',
  'arrow-up': 'M12 19V5m-6 6 6-6 6 6',
  'log-out': 'M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4',
} as const

export function IconButton({ className, icon, type = 'button', ...props }: IconButtonProps) {
  return (
    <button className={`${styles.button} ${className ?? ''}`}
      type={type}
      {...props}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d={iconPaths[icon]} />
      </svg>
    </button>
  )
}
