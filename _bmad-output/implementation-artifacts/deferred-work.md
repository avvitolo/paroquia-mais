# Deferred Work

## Deferred from: code review of 5-2-schedule-notifications (2026-04-13)

- **Loop sequencial de envio (Med)** — `services/notification.service.ts:38` — Loop `for...of` com `await` por e-mail bloqueia O(n) round-trips. Considerar `Promise.allSettled` para envios paralelos.
- **RESEND_API_KEY não validada no startup (Med)** — `new Resend(undefined)` silencia o erro de configuração até o primeiro send. Adicionar validação explícita no boot.
- **FROM_EMAIL fallback para sandbox sem aviso (Med)** — `process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'` mascara configuração ausente em produção com endereço de sandbox.
- **E-mail de membro em logs de falha (Med, LGPD)** — `console.error(...memberEmail...)` expõe PII nos logs de servidor. Pseudonimizar (ex: apenas domínio) antes do go-live.
- **Sem rate-limit no loop de envios (Med)** — Escalas com muitos membros podem esgotar quota da Resend num único request.
- **Lista de assignments vazia não gera log (Low)** — Retorno silencioso impede distinguir "zero membros" de bug de fetch.
