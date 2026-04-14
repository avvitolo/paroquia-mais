// Serviço de notificações — envia e-mails quando uma escala é publicada
// Regra: não importa Supabase diretamente; usa a camada MCP
import 'server-only'
import { Resend } from 'resend'
import { getScheduleWithAssignments } from '@/lib/mcp/schedule.mcp'

// Item 2 — Validação de RESEND_API_KEY no startup (antes de qualquer envio)
if (!process.env.RESEND_API_KEY) {
  console.warn(
    '[notification] RESEND_API_KEY não configurada — notificações por e-mail desabilitadas. Configure esta variável antes do go-live.'
  )
}

const resend = new Resend(process.env.RESEND_API_KEY)

// Item 3 — FROM_EMAIL: avisa se ainda usa o endereço sandbox do Resend
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Paróquia+ <onboarding@resend.dev>'
if (!process.env.RESEND_FROM_EMAIL) {
  console.warn(
    '[notification] RESEND_FROM_EMAIL não configurada — usando endereço sandbox. Configure esta variável antes do go-live.'
  )
} else if (process.env.RESEND_FROM_EMAIL.includes('onboarding@resend.dev')) {
  console.warn(
    '[notification] RESEND_FROM_EMAIL ainda usa o endereço sandbox do Resend (onboarding@resend.dev). Antes do go-live, verifique um domínio no painel do Resend e atualize esta variável.'
  )
}

const APP_URL = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

// Escapa caracteres HTML para evitar XSS no corpo do e-mail
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Item 4 — Pseudonimiza endereço de e-mail para logs (LGPD)
// Preserva apenas o domínio: "user@gmail.com" → "***@gmail.com"
function pseudonymizeEmail(email: string): string {
  const atIndex = email.indexOf('@')
  if (atIndex === -1) return '***'
  return '***' + email.slice(atIndex)
}

// Envia e-mail de notificação para cada membro escalado quando a escala é publicada.
// Membros sem e-mail são silenciosamente ignorados.
// Erros de envio são logados mas não revertem a publicação.
export async function sendSchedulePublishedNotification(
  scheduleId: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[sendSchedulePublishedNotification] RESEND_API_KEY ausente — notificações ignoradas.')
    return
  }

  let scheduleData: Awaited<ReturnType<typeof getScheduleWithAssignments>>

  try {
    scheduleData = await getScheduleWithAssignments(scheduleId)
  } catch (e) {
    console.error('[sendSchedulePublishedNotification] falha ao buscar dados da escala:', e)
    return
  }

  if (!scheduleData) {
    console.error('[sendSchedulePublishedNotification] escala não encontrada:', scheduleId)
    return
  }

  const { schedule, assignments } = scheduleData

  // Null-guard: celebrations pode ser nulo se celebração foi removida após criação da escala
  if (!schedule.celebrations) {
    console.error('[sendSchedulePublishedNotification] escala sem celebração associada:', scheduleId)
    return
  }

  const { title, date, time } = schedule.celebrations

  // Link direto para a página de confirmação
  const confirmationUrl = `${APP_URL}/schedules/${scheduleId}`

  // Envia um e-mail para cada membro que tem endereço de e-mail cadastrado
  for (const assignment of assignments) {
    const memberEmail = assignment.members?.email
    if (!memberEmail) continue // membro sem e-mail — ignorar silenciosamente

    const memberName = assignment.members?.full_name ?? 'Membro'
    const role = assignment.role

    const subject = `Você foi escalado — ${title} em ${date}`

    const text = [
      `Olá ${memberName},`,
      '',
      'Você foi escalado para:',
      `- Celebração: ${title}`,
      `- Data: ${date} às ${time}`,
      `- Função: ${role}`,
      '',
      'Acesse para confirmar sua presença:',
      `<${confirmationUrl}>`,
      '',
      'Paróquia+',
    ].join('\n')

    // Valores escapados para uso seguro no HTML do e-mail
    const safeTitle = escapeHtml(title)
    const safeDate = escapeHtml(date)
    const safeTime = escapeHtml(time)
    const safeMemberName = escapeHtml(memberName)
    const safeRole = escapeHtml(role)
    const safeUrl = escapeHtml(confirmationUrl)

    const html = `
      <p>Olá <strong>${safeMemberName}</strong>,</p>
      <p>Você foi escalado para:</p>
      <ul>
        <li><strong>Celebração:</strong> ${safeTitle}</li>
        <li><strong>Data:</strong> ${safeDate} às ${safeTime}</li>
        <li><strong>Função:</strong> ${safeRole}</li>
      </ul>
      <p>
        <a href="${safeUrl}" style="background:#002045;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;display:inline-block;">
          Confirmar presença
        </a>
      </p>
      <p style="color:#666;font-size:12px;">Paróquia+</p>
    `.trim()

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: memberEmail,
        subject,
        text,
        html,
      })
    } catch (e) {
      // Item 4 — Log pseudonimizado (LGPD): não expõe o e-mail completo do membro
      const safeRecipient = pseudonymizeEmail(memberEmail)
      const errMsg = e instanceof Error ? e.message : String(e)
      console.error(
        `[sendSchedulePublishedNotification] falha ao enviar para ${safeRecipient}: ${errMsg}`
      )
    }
  }
}
