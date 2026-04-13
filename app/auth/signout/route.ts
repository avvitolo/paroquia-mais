// Route Handler para logout forçado — usado quando usuário está autenticado
// mas sem registro em public.users (estado inconsistente)
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(`${origin}/login`)
}
