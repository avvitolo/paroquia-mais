'use server'

// Server Action — cria sessão de Checkout no Stripe e redireciona o usuário
import Stripe from 'stripe'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCheckoutSession(data: {
  parishName: string
  email: string
  plan: 'basico' | 'pro'
}) {
  const headersList = await headers()
  const origin = headersList.get('origin') ?? headersList.get('host') ?? ''
  const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`

  // Seleciona o price ID de acordo com o plano escolhido
  const priceId =
    data.plan === 'pro'
      ? process.env.STRIPE_PRICE_ID_PRO!
      : process.env.STRIPE_PRICE_ID_BASICO!

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: data.email,
    // Não exige cartão quando o total devido hoje é R$0 (trial ativo)
    payment_method_collection: 'if_required',
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: data.plan === 'basico'
      ? {
          trial_period_days: 30,
          trial_settings: {
            end_behavior: { missing_payment_method: 'cancel' },
          },
        }
      : undefined,
    metadata: {
      parish_name: data.parishName,
      admin_email: data.email,
      plan: data.plan,
    },
    success_url: `${baseUrl}/register/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/register?canceled=true`,
  })

  // Redireciona para a página de checkout do Stripe
  redirect(session.url!)
}
