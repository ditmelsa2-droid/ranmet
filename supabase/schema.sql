-- ============================================================
-- RanMet — Full Fix & Schema for Supabase (Postgres)
-- Chạy toàn bộ file này trong Supabase -> SQL Editor -> Run
-- ============================================================

-- Cấp quyền truy cập Schema và Bảng cho các role của Supabase
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  birthday date,
  age_verified boolean not null default false,
  country text,
  tz_offset int,
  languages text[] not null default '{}',
  interests text[] not null default '{}',
  conversation_style text,
  bio text,
  avatar_seed text,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are viewable by authenticated users" on public.profiles;
create policy "profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- TRUST ENGINE ----------
create table if not exists public.trust_scores (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  score int not null default 100 check (score >= 0 and score <= 1000),
  updated_at timestamptz not null default now()
);
alter table public.trust_scores enable row level security;

drop policy if exists "trust score viewable by authenticated users" on public.trust_scores;
create policy "trust score viewable by authenticated users"
  on public.trust_scores for select to authenticated using (true);

drop policy if exists "trust score insertable by authenticated users" on public.trust_scores;
create policy "trust score insertable by authenticated users"
  on public.trust_scores for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "trust score updateable by authenticated users" on public.trust_scores;
create policy "trust score updateable by authenticated users"
  on public.trust_scores for update to authenticated using (auth.uid() = user_id);

create table if not exists public.trust_log (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta int not null,
  reason text not null,
  created_at timestamptz not null default now()
);
alter table public.trust_log enable row level security;

drop policy if exists "users view own trust log" on public.trust_log;
create policy "users view own trust log"
  on public.trust_log for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users insert own trust log" on public.trust_log;
create policy "users insert own trust log"
  on public.trust_log for insert
  to authenticated
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user_trust()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.trust_scores (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created_trust on public.profiles;
create trigger on_profile_created_trust
  after insert on public.profiles
  for each row execute function public.handle_new_user_trust();

create or replace function public.add_trust(p_user_id uuid, p_delta int, p_reason text)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.trust_scores (user_id, score) values (p_user_id, 100)
  on conflict (user_id) do nothing;

  update public.trust_scores
    set score = greatest(0, least(1000, score + p_delta)), updated_at = now()
    where user_id = p_user_id;
    
  insert into public.trust_log (user_id, delta, reason) values (p_user_id, p_delta, p_reason);
end;
$$;

-- ---------- CHAT ----------
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  compatibility int,
  compatibility_breakdown jsonb,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  constraint different_users check (user_a <> user_b)
);
alter table public.chats enable row level security;

drop policy if exists "participants can view their chats" on public.chats;
create policy "participants can view their chats"
  on public.chats for select to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "authenticated users can create a chat they're part of" on public.chats;
create policy "authenticated users can create a chat they're part of"
  on public.chats for insert to authenticated
  with check (auth.uid() = user_a or auth.uid() = user_b);

create table if not exists public.messages (
  id bigserial primary key,
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  kind text not null default 'text',
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;

drop policy if exists "participants can view messages in their chats" on public.messages;
create policy "participants can view messages in their chats"
  on public.messages for select to authenticated
  using (exists (
    select 1 from public.chats c
    where c.id = chat_id and (c.user_a = auth.uid() or c.user_b = auth.uid())
  ));

drop policy if exists "participants can send messages in their chats" on public.messages;
create policy "participants can send messages in their chats"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.chats c
      where c.id = chat_id and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

-- Bật Realtime cho messages
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- Đồng bộ dữ liệu cho các tài khoản tạo trước đó
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

insert into public.trust_scores (user_id)
select id from public.profiles
on conflict (user_id) do nothing;
