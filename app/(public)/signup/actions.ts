'use server'

// Server Action para criação de conta com email e senha
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function signUp(fullName: string, email: string, password: string) {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') ?? ''

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Redireciona para o callback após confirmar o email
      emailRedirectTo: `${origin}/auth/callback`,
      data: { full_name: fullName },
    },
  })

  if (error) throw new Error(error.message)
}
