-- Corrige RLS da tabela users para permitir que o usuário leia seu próprio registro
-- mesmo quando parish_id ainda não está no JWT (ex: primeiro login após signup)

-- Remove policy original que depende exclusivamente do JWT parish_id
drop policy if exists "Users can view members of their parish" on users;

-- Nova policy: usuário vê seu próprio registro (por auth.uid) OU
-- qualquer membro da mesma paróquia (quando parish_id estiver no JWT)
create policy "Users can view their own record and parish members"
  on users for select
  using (
    id = auth.uid()
    or parish_id = (auth.jwt() ->> 'parish_id')::uuid
  );
