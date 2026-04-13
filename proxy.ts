// Proxy de autenticação — roda no Edge Runtime para proteger rotas (Next.js 16+: proxy.ts substituiu middleware.ts)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/celebrations',
  '/schedules',
  '/members',
  '/pastorals',
  '/settings',
]

// Rotas que exigem papel 'admin' — redirecionam para /dashboard se outro papel tentar acessar
const ADMIN_ONLY_PATHS = ['/settings']

// Cria resposta de redirect preservando os cookies de sessão do Supabase
// Sem isso, o browser perde a sessão e entra em loop de redirecionamento
function redirectWithSession(url: URL, supabaseResponse: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url)
  supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
    redirect.cookies.set(name, value)
  })
  return redirect
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Cria cliente Supabase inline — NÃO importar lib/supabase/server (usa next/headers, indisponível no Edge)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Atualiza a sessão e obtém o usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redireciona usuários não autenticados para /login ao acessar rotas protegidas
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return redirectWithSession(url, supabaseResponse)
  }

  // Redireciona usuários autenticados que tentam acessar /login ou a raiz
  if ((pathname === '/login' || pathname === '/') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return redirectWithSession(url, supabaseResponse)
  }

  // Protege rotas exclusivas de admin — redireciona outros papéis para /dashboard
  // O papel está no app_metadata (definido via inviteUserByEmail no webhook Stripe)
  if (user) {
    const role = user.app_metadata?.role as string | undefined
    const isAdminOnly = ADMIN_ONLY_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + '/')
    )
    if (isAdminOnly && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return redirectWithSession(url, supabaseResponse)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
