-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Parishes table
create table if not exists parishes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Users table (extends Supabase auth.users)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  parish_id uuid not null references parishes(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table parishes enable row level security;
alter table users enable row level security;

-- RLS Policies for parishes
-- Users can only see their own parish
create policy "Users can view their own parish"
  on parishes for select
  using (id = (auth.jwt() ->> 'parish_id')::uuid);

-- RLS Policies for users
-- Users can only see members of their own parish
create policy "Users can view members of their parish"
  on users for select
  using (parish_id = (auth.jwt() ->> 'parish_id')::uuid);

-- Users can update their own profile
create policy "Users can update their own profile"
  on users for update
  using (id = auth.uid());
