// Edge Function — recebe e processa webhooks do Stripe (Story 1.3)
// Cria paróquia, assinatura e convida o admin via Magic Link
import Stripe from 'https://esm.sh/stripe@17?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

Deno.serve(async (req: Request) => {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

  // Verifica assinatura do webhook para garantir autenticidade
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Falha na verificação da assinatura Stripe:', message)
    return new Response(`Webhook Error: ${message}`, { status: 400 })
  }

  // Processa apenas o evento de checkout concluído com sucesso
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { parish_name, admin_email, plan } = session.metadata!

    // Cliente Supabase com service role para operações administrativas
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Cria a paróquia no banco de dados
    const { data: parish, error: parishError } = await supabase
      .from('parishes')
      .insert({ name: parish_name })
      .select()
      .single()

    if (parishError) {
      console.error('Erro ao criar paróquia:', parishError.message)
      return new Response('DB error: parishes', { status: 500 })
    }

    // Registra a assinatura vinculada à paróquia e ao cliente Stripe
    const { error: subError } = await supabase.from('subscriptions').insert({
      parish_id: parish.id,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      stripe_session_id: session.id,
      plan,
      status: 'active',
    })

    if (subError) {
      console.error('Erro ao criar assinatura:', subError.message)
      return new Response('DB error: subscriptions', { status: 500 })
    }

    // Convida o administrador via email
    // data: define raw_user_meta_data; app_metadata é atualizado separadamente abaixo
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(admin_email, {
      data: { full_name: admin_email, parish_id: parish.id, role: 'admin' },
    })

    if (inviteError) {
      console.error('Erro ao convidar admin:', inviteError.message)
      return new Response('Auth error: invite', { status: 500 })
    }

    // Atualiza app_metadata com parish_id e role — necessário para RLS e JWT claims
    // inviteUserByEmail só define user_metadata; app_metadata requer updateUserById
    if (inviteData.user) {
      await supabase.auth.admin.updateUserById(inviteData.user.id, {
        app_metadata: { parish_id: parish.id, role: 'admin' },
      })

      // Cria o registro em public.users imediatamente (sem aguardar trigger)
      await supabase.from('users').insert({
        id: inviteData.user.id,
        parish_id: parish.id,
        full_name: admin_email,
        email: admin_email,
        role: 'admin',
      })
    }
  }

  return new Response('ok', { status: 200 })
})
