// Página de celebrações — Stories 3.1 e 3.2
import { getCelebrations } from '@/lib/mcp/celebration.mcp'
import { CelebrationCrud } from '@/components/celebrations/celebration-crud'

export default async function CelebrationsPage() {
  const celebrations = await getCelebrations(true) // inclui passadas para edição

  return (
    <div className="max-w-5xl mx-auto">
      <CelebrationCrud initialCelebrations={celebrations} />
    </div>
  )
}
