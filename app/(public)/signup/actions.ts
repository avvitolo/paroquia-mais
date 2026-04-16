'use server'

// Server Action para criação de conta com email e senha
// Cria o auth user, a paróquia e o registro em public.users em uma única operação
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signUp(
  fullName: string,
  email: string,
  password: string,
  parishName: string
) {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') ?? ''

  // 1. Cria o usuário no Supabase Auth
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { full_name: fullName },
    },
  })

  if (signUpError) throw new Error(signUpError.message)
  if (!authData.user) throw new Error('Falha ao criar usuário')

  // 2. Usa service role para criar paróquia e usuário no banco
  const admin = createAdminClient()

  const { data: parish, error: parishError } = await admin
    .from('parishes')
    .insert({ name: parishName })
    .select()
    .single()

  if (parishError) throw new Error('Falha ao criar paróquia: ' + parishError.message)

  // 3. Cria o registro em public.users vinculado à paróquia
  const { error: userError } = await admin.from('users').insert({
    id: authData.user.id,
    parish_id: parish.id,
    full_name: fullName,
    email,
    role: 'admin_sistema',
  })

  if (userError) throw new Error('Falha ao criar usuário no banco: ' + userError.message)

  // 4. Atualiza app_metadata com parish_id e role (necessário para JWT e RLS policies)
  await admin.auth.admin.updateUserById(authData.user.id, {
    app_metadata: { parish_id: parish.id, role: 'admin_sistema' },
  })

  // 5. Se a confirmação de email está desabilitada, authData.session já existe —
  //    redireciona direto para o dashboard sem precisar verificar email
  if (authData.session) {
    redirect('/dashboard')
  }

  // Caso contrário, retorna normalmente e a página mostra "verifique seu email"
}
