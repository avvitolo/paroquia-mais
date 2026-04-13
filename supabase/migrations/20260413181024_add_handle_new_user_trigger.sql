-- Função que cria o registro em public.users quando um novo auth.user é criado
-- Lê parish_id e role do app_metadata (definido pelo webhook Stripe via inviteUserByEmail)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Só cria o registro se parish_id estiver presente no app_metadata
  if new.raw_app_meta_data->>'parish_id' is not null then
    insert into public.users (id, parish_id, email, full_name, role)
    values (
      new.id,
      (new.raw_app_meta_data->>'parish_id')::uuid,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', new.email),
      coalesce(new.raw_app_meta_data->>'role', 'member')
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

-- Remove trigger anterior se existir e recria
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();