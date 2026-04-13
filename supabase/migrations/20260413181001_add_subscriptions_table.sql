-- Tabela de assinaturas: vincula paróquia ao plano Stripe
create table if not exists subscriptions (
  id                     uuid primary key default uuid_generate_v4(),
  parish_id              uuid not null references parishes(id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  stripe_session_id      text,
  plan                   text not null check (plan in ('basico', 'pro')),
  status                 text not null default 'active'
                           check (status in ('active', 'inactive', 'past_due', 'canceled')),
  created_at             timestamptz not null default now()
);

-- Habilita Row Level Security
alter table subscriptions enable row level security;

-- Política: usuário só vê a assinatura da sua própria paróquia
create policy "Users can view their parish subscription"
  on subscriptions for select
  using (parish_id = (auth.jwt() ->> 'parish_id')::uuid);