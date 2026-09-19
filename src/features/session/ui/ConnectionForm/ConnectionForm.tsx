import { useActionState } from 'react'
import { credentialsSchema } from '../../model/credentials.schema'
import type { Credentials } from '../../model/credentials.schema'
import { useSession } from '../../model/session-context'
import { SubmitButton } from '../SubmitButton/SubmitButton'
import styles from './ConnectionForm.module.scss'

type FieldName = keyof Credentials

type ConnectionState = {
  error: string | null
  fieldErrors: Partial<Record<FieldName, string>>
}

const fieldNames = {
  apiUrl: 'apiUrl',
  idInstance: 'idInstance',
  apiTokenInstance: 'apiTokenInstance',
} as const satisfies Record<FieldName, FieldName>

const initialState: ConnectionState = { error: null, fieldErrors: {} }
const defaultCredentials = {
  apiUrl: import.meta.env.VITE_GREEN_API_URL,
  idInstance: import.meta.env.VITE_GREEN_API_ID_INSTANCE,
  apiTokenInstance: import.meta.env.VITE_GREEN_API_TOKEN_INSTANCE,
}

function getFormValue(formData: FormData, name: FieldName) {
  return String(formData.get(name) ?? '')
}

function getFieldErrors(error: NonNullable<ReturnType<typeof credentialsSchema.safeParse>['error']>) {
  const errors = error.flatten().fieldErrors

  return Object.fromEntries(
    Object.entries(errors).map(([name, messages]) => [name, messages?.[0]]),
  ) as ConnectionState['fieldErrors']
}

export function ConnectionForm() {
  const { connect } = useSession()
  const [state, formAction] = useActionState(async (_previousState: ConnectionState, formData: FormData) => {
    const credentials = credentialsSchema.safeParse({
      apiUrl: getFormValue(formData, fieldNames.apiUrl),
      idInstance: getFormValue(formData, fieldNames.idInstance),
      apiTokenInstance: getFormValue(formData, fieldNames.apiTokenInstance),
    })

    if (!credentials.success) {
      return { error: null, fieldErrors: getFieldErrors(credentials.error) }
    }

    try {
      await connect(credentials.data)

      return initialState
    } catch (reason) {
      return {
        error: reason instanceof Error ? reason.message : 'Не удалось подключиться',
        fieldErrors: {},
      }
    }
  }, initialState)

  return (
    <main className={styles.page}>
      <form className={styles.card} action={formAction}>
        <div className={styles.logo} aria-hidden="true">M</div>
        <p className={styles.kicker}>GREEN-API для MAX</p>
        <h1>Подключить чат</h1>
        <p className={styles.description}>Введите параметры инстанса. Токен используется только в памяти этой вкладки.</p>

        <label>
          API URL
          <input
            name={fieldNames.apiUrl}
            placeholder="https://..."
            type="url"
            required
            autoFocus
            defaultValue={defaultCredentials.apiUrl}
            aria-invalid={Boolean(state.fieldErrors.apiUrl)}
            aria-describedby={state.fieldErrors.apiUrl ? 'api-url-error' : undefined}
          />
          {state.fieldErrors.apiUrl
            ? <span className={styles.fieldError} id="api-url-error">{state.fieldErrors.apiUrl}</span>
            : null}
        </label>
        <label>
          ID инстанса
          <input
            name={fieldNames.idInstance}
            inputMode="numeric"
            required
            defaultValue={defaultCredentials.idInstance}
            aria-invalid={Boolean(state.fieldErrors.idInstance)}
            aria-describedby={state.fieldErrors.idInstance ? 'instance-id-error' : undefined}
          />
          {state.fieldErrors.idInstance
            ? <span className={styles.fieldError} id="instance-id-error">{state.fieldErrors.idInstance}</span>
            : null}
        </label>
        <label>
          Токен инстанса
          <input
            name={fieldNames.apiTokenInstance}
            type="password"
            required
            defaultValue={defaultCredentials.apiTokenInstance}
            aria-invalid={Boolean(state.fieldErrors.apiTokenInstance)}
            aria-describedby={state.fieldErrors.apiTokenInstance ? 'instance-token-error' : undefined}
          />
          {state.fieldErrors.apiTokenInstance
            ? <span className={styles.fieldError} id="instance-token-error">{state.fieldErrors.apiTokenInstance}</span>
            : null}
        </label>

        {state.error ? <p className={styles.error} role="alert">{state.error}</p> : null}
        <SubmitButton />
      </form>
    </main>
  )
}
