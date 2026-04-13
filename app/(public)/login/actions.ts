'use server'

// Server Action para autenticação via Magic Link
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function signInWithMagicLink(email: string) {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') ?? ''

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // URL absoluta para o callback — Supabase redireciona para cá após o clique no link
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) throw error
}
