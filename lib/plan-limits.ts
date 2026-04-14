// Limites de plano por recurso — usados para enforcement em Server Actions (Story 6.2)
// Atualizar aqui reflete imediatamente em todas as validações sem re-deploy de DB

type PlanLimits = {
  members: number
  pastorals: number
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  basico: {
    members: 30,
    pastorals: 3,
  },
  pro: {
    members: Infinity,
    pastorals: Infinity,
  },
}

// Retorna os limites do plano especificado.
// Plano desconhecido ou ausente: retorna limites ilimitados (fail-open).
export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.pro
}
