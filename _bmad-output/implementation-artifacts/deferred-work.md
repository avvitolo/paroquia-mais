# Deferred Work

## Itens concluídos em 2026-04-14 (pre-go-live hardening)

- ~~**RESEND_API_KEY não validada no startup**~~ — resolvido: warning no carregamento do módulo
- ~~**FROM_EMAIL fallback para sandbox sem aviso**~~ — resolvido: warning explícito se não configurada ou ainda usando sandbox
- ~~**E-mail de membro em logs de falha (LGPD)**~~ — resolvido: `pseudonymizeEmail()` expõe apenas domínio

## Pendente (deferred de 5-2-schedule-notifications, 2026-04-13)

- **Loop sequencial de envio (Med)** — `services/notification.service.ts` — Loop `for...of` com `await` por e-mail bloqueia O(n) round-trips. Considerar `Promise.allSettled` para envios paralelos.
- **Sem rate-limit no loop de envios (Med)** — Escalas com muitos membros podem esgotar quota da Resend num único request.
- **Lista de assignments vazia não gera log (Low)** — Retorno silencioso impede distinguir "zero membros" de bug de fetch.

## Pendente (pre-go-live manual — requer ação do usuário)

- **FROM_EMAIL em produção** — `RESEND_FROM_EMAIL` ainda usa `onboarding@resend.dev` (sandbox do Resend). Antes do go-live: verificar domínio próprio no painel do Resend e atualizar a variável de ambiente na Vercel.
- **SMTP from address em Supabase** — `supabase/config.toml [auth.email.smtp] admin_email` também usa `onboarding@resend.dev`. Atualizar junto com o passo acima.
