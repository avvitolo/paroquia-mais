-- Adiciona o papel 'coordinator' ao check constraint da tabela users
-- O constraint original só permitia 'admin' e 'member'
alter table users
  drop constraint if exists users_role_check;

alter table users
  add constraint users_role_check
    check (role in ('admin', 'coordinator', 'member'));
