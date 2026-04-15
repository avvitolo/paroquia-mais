// Página de assinatura — exibe status e plano atual da paróquia
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import { getSubscriptionByParishId } from '@/lib/mcp/parish.mcp'
import { redirect } from 'next/navigation'
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react'

const STATUS_CONFIG = {
  active: {
    icon: CheckCircle,
    label: 'Ativa',
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    message: 'Sua assinatura está ativa. Todos os recursos estão disponíveis.',
  },
  inactive: {
    icon: AlertTriangle,
    label: 'Inativa',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    message: 'Sua assinatura está inativa. Entre em contato para reativar.',
  },
  past_due: {
    icon: Clock,
    label: 'Pagamento pendente',
    color: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-200',
    message: 'Há um pagamento em aberto. Regularize para restaurar o acesso completo.',
  },
  canceled: {
    icon: XCircle,
    label: 'Cancelada',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    message: 'Sua assinatura foi cancelada. Cadastre uma nova paróquia para continuar.',
  },
}

const PLAN_LABELS: Record<string, string> = {
  basico: 'Plano Teste',
  pro: 'Pro',
}

export default async function SubscriptionPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const subscription = await getSubscriptionByParishId(user.parish_id)
  const status = subscription?.status ?? 'inactive'
  const plan = subscription?.plan ?? 'basico'
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.inactive
  const Icon = config.icon

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#002045]">Assinatura</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Informações sobre o plano da sua paróquia.
        </p>
      </div>

      {/* Card de status */}
      <div className={`rounded-xl border p-6 flex items-start gap-4 ${config.bg}`}>
        <Icon className={`h-6 w-6 mt-0.5 shrink-0 ${config.color}`} />
        <div>
          <p className={`font-semibold ${config.color}`}>{config.label}</p>
          <p className="text-sm text-muted-foreground mt-1">{config.message}</p>
        </div>
      </div>

      {/* Detalhes do plano */}
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm text-muted-foreground">Plano</span>
          <span className="font-semibold text-[#002045]">
            <span className="inline-flex items-center gap-1.5">
              {PLAN_LABELS[plan] ?? plan}
              {plan === 'pro' && (
                <span className="bg-[#fed65b] text-[#002045] text-xs font-bold rounded-full px-2 py-0.5">
                  PRO
                </span>
              )}
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm text-muted-foreground">Status</span>
          <span className={`font-semibold ${config.color}`}>{config.label}</span>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm text-muted-foreground">Paróquia</span>
          <span className="font-semibold text-[#002045]">{user.full_name}</span>
        </div>
      </div>

      {/* Ação: só mostra contato se não estiver ativa */}
      {status !== 'active' && (
        <div className="rounded-xl border border-dashed border-[#002045]/20 p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Precisa de ajuda para reativar sua assinatura?
          </p>
          <a
            href="mailto:suporte@paroquiamais.com.br"
            className="inline-flex items-center justify-center bg-[#002045] text-white font-medium rounded-lg px-6 py-2.5 text-sm hover:bg-[#1a365d] transition-colors"
          >
            Entrar em contato
          </a>
        </div>
      )}
    </div>
  )
}
