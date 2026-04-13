// Página de gestão de pastorais — Story 2.2
// Server Component: busca pastorais e passa para o componente client de CRUD
import { getPastorals } from '@/lib/mcp/pastoral.mcp'
import { PastoralCrud } from '@/components/pastorals/pastoral-crud'

export default async function PastoralsPage() {
  const pastorals = await getPastorals()

  return (
    <div className="max-w-5xl mx-auto">
      <PastoralCrud initialPastorals={pastorals} />
    </div>
  )
}
