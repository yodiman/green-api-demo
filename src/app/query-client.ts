import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  })

  client.setQueryDefaults(['chat'], { gcTime: Infinity })

  return client
}
