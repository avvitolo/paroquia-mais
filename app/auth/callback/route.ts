// Route Handler para troca do código PKCE por sessão
// Usado tanto no login/signup (magic link / email confirm) quanto na recuperação de senha
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // next define para onde redirecionar após autenticação (padrão: /dashboard)
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Código inválido ou ausente — redireciona para login com mensagem de erro
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
