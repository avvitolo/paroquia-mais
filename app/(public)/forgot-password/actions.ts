'use server'

// Server Action para recuperação de senha
// Gera o link de recovery via admin client (service role) e envia via Resend,
// bypassing o provedor de email do Supabase (que tem limite de 3/hora no free tier).
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { headers } from 'next/headers'

export async function requestPasswordReset(email: string) {
  const headersList = await headers()
  const origin = headersList.get('origin') ?? process.env.APP_URL ?? ''

  const admin = createAdminClient()

  // Gera o link de recovery com service role — não envia email pelo Supabase
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    },
  })

  if (error) throw new Error(error.message)
  if (!data?.properties?.action_link) throw new Error('Falha ao gerar link de recuperação')

  // Envia via Resend diretamente
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'Paróquia+ <onboarding@resend.dev>',
    to: email,
    subject: 'Recuperação de senha — Paróquia+',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;">
        <h1 style="color:#002045;font-size:22px;margin-bottom:8px;">Recuperar senha</h1>
        <p style="color:#555;font-size:15px;line-height:1.6;margin-bottom:24px;">
          Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Paróquia+</strong>.
          Clique no botão abaixo para criar uma nova senha.
        </p>
        <a href="${data.properties.action_link}"
           style="display:inline-block;background-color:#002045;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
          Redefinir minha senha
        </a>
        <p style="color:#999;font-size:12px;margin-top:32px;line-height:1.5;">
          Se você não solicitou a recuperação de senha, ignore este e-mail.<br/>
          O link expira em 1 hora.
        </p>
      </div>
    `,
  })

  if (emailError) throw new Error('Falha ao enviar e-mail de recuperação')
}
