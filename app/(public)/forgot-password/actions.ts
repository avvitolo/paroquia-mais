'use server'

// Server Action para solicitar email de recuperação de senha
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function requestPasswordReset(email: string) {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') ?? ''

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Após clicar no link, o Supabase redireciona para o callback com type=recovery
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  if (error) throw new Error(error.message)
}
