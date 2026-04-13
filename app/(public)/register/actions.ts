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
    line_items: [{ price: priceId, quantity: 1 }],
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
