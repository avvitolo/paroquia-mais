// Helper para atualizar sessão do Supabase no middleware do Next.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Atualiza cookies na requisição e na resposta para manter sessão sincronizada
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            // Remove maxAge/expires para que o cookie seja de sessão (expira ao fechar o browser)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { maxAge, expires, ...sessionOptions } = options as Record<string, unknown>
            supabaseResponse.cookies.set(name, value, sessionOptions as Parameters<typeof supabaseResponse.cookies.set>[2])
          })
        },
      },
    }
  )

  // Atualiza sessão — necessário para que tokens de acesso não expirem
  await supabase.auth.getUser()

  return supabaseResponse
}
