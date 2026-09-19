type ApiErrorKind = 'network' | 'http' | 'invalid-response'

function assertNever(value: never): never {
  throw new Error(`Неизвестный тип ошибки API: ${String(value)}`)
}

function getApiErrorMessage(kind: ApiErrorKind, status?: number): string {
  switch (kind) {
    case 'network':
      return 'Не удалось связаться с GREEN-API. Проверьте сеть, apiUrl и CORS.'
    case 'invalid-response':
      return 'GREEN-API вернул неожиданный ответ.'
    case 'http':
      if (status === 401 || status === 403) {
        return 'Проверьте параметры инстанса и его доступ.'
      }

      if (status === 429) {
        return 'Превышен лимит запросов GREEN-API.'
      }

      return 'Запрос GREEN-API завершился ошибкой.'
    default:
      return assertNever(kind)
  }
}

export class ApiError extends Error {
  constructor(public readonly kind: ApiErrorKind, public readonly status?: number) {
    super(getApiErrorMessage(kind, status))
  }
}
