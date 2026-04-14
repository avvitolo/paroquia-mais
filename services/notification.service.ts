// Serviço de notificações — envia e-mails quando uma escala é publicada
// Regra: não importa Supabase diretamente; usa a camada MCP
import 'server-only'
import { Resend } from 'resend'
import { getScheduleWithAssignments } from '@/lib/mcp/schedule.mcp'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Paróquia+ <onboarding@resend.dev>'
const APP_URL = process.env.APP_URL ?? 'http://localhost:3000'

// Escapa caracteres HTML para evitar XSS no corpo do e-mail
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Envia e-mail de notificação para cada membro escalado quando a escala é publicada.
// Membros sem e-mail são silenciosamente ignorados.
// Erros de envio são logados mas não revertem a publicação.
export async function sendSchedulePublishedNotification(
  scheduleId: string
): Promise<void> {
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
      // Log do erro individual — não interrompe o loop nem reverte a publicação
      console.error('[sendSchedulePublishedNotification] falha ao enviar e-mail:', e)
    }
  }
}
