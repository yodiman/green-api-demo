/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GREEN_API_URL?: string
  readonly VITE_GREEN_API_ID_INSTANCE?: string
  readonly VITE_GREEN_API_TOKEN_INSTANCE?: string
  readonly VITE_GREEN_API_RECEIVE_TIMEOUT_SECONDS?: string
  readonly VITE_GREEN_API_POLLING_DELAY_MS?: string
  readonly VITE_GREEN_API_POLLING_ERROR_DELAY_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
