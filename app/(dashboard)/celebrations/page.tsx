// Página de celebrações — Stories 3.1, 3.2 + S4 (requisitos de função)
import { getCelebrations } from '@/lib/mcp/celebration.mcp'
import { getPastorals } from '@/lib/mcp/pastoral.mcp'
import { getAllPastoralRoles } from '@/lib/mcp/pastoral-role.mcp'
import { getCelebrationRequirements } from '@/lib/mcp/celebration-requirement.mcp'
import { CelebrationCrud } from '@/components/celebrations/celebration-crud'

export default async function CelebrationsPage() {
  const [celebrations, pastorals, allRolesFlat] = await Promise.all([
    getCelebrations(true),
    getPastorals(),
    getAllPastoralRoles(),
  ])

  // Agrupa roles por pastoral_id para uso no componente
  const allRoles = allRolesFlat.reduce<Record<string, typeof allRolesFlat>>((acc, r) => {
    if (!acc[r.pastoral_id]) acc[r.pastoral_id] = []
    acc[r.pastoral_id].push(r)
    return acc
  }, {})

  // Carrega requisitos de todas as celebrações em paralelo
  const reqEntries = await Promise.all(
    celebrations.map(async (c) => [c.id, await getCelebrationRequirements(c.id)] as const)
  )
  const initialRequirements = Object.fromEntries(reqEntries)

  return (
    <div className="max-w-5xl mx-auto">
      <CelebrationCrud
        initialCelebrations={celebrations}
        pastorals={pastorals}
        allRoles={allRoles}
        initialRequirements={initialRequirements}
      />
    </div>
  )
}
