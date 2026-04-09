# 1. Visão Geral da Arquitetura

Sistema SaaS multi-tenant baseado em:

- Next.js 15 (App Router, Server Components, Server Actions)
- Supabase (PostgreSQL, Auth, RLS)
- Supabase MCP (camada obrigatória de acesso a dados)
- Stripe (webhooks via Edge Functions)

Arquitetura server-first, sem API layer desnecessária.

---
