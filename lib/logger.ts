// Utilitário de logging estruturado para operações críticas (Story 6.1)
// Usado exclusivamente em Server Actions — não importar em Client Components

export type LogParams = {
  operation: string
  userId: string
  parishId: string
  status: 'success' | 'failure'
  error?: unknown
}

// Registra operação crítica como JSON estruturado no stdout do servidor.
// Em produção (Vercel), esses logs ficam visíveis no painel de Functions.
export function logOperation(params: LogParams): void {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    operation: params.operation,
    userId: params.userId,
    parishId: params.parishId,
    status: params.status,
  }

  if (params.status === 'failure' && params.error !== undefined) {
    // Extrai mensagem sem expor stack trace completo
    entry.error =
      params.error instanceof Error ? params.error.message : String(params.error)
  }

  console.log(JSON.stringify(entry))
}
