// Página principal do dashboard — Story 5.1 (confirmação de presença para membros)
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import { getMemberByUserId } from '@/lib/mcp/member.mcp'
import { getMyAssignments } from '@/lib/mcp/schedule.mcp'
import { MemberAssignments } from '@/components/dashboard/member-assignments'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) return null

  // Busca o membro vinculado ao usuário logado (se houver)
  const member = await getMemberByUserId(user.id)
  const assignments = member ? await getMyAssignments(member.id) : []

  // getMyAssignments já filtra status=published no banco (T1 fix)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#002045]">Olá, {user.full_name.split(' ')[0]}!</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {assignments.length > 0 ? (
        <MemberAssignments assignments={assignments as Parameters<typeof MemberAssignments>[0]['assignments']} />
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground text-sm">
          {member
            ? 'Nenhuma escala publicada aguardando confirmação.'
            : 'Seu usuário ainda não está vinculado a um registro de membro.'}
        </div>
      )}
    </div>
  )
}
