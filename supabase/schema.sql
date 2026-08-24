-- ============================================================
-- RanMet — Full Production Schema for Supabase (Postgres)
-- ============================================================

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
  avatar_url text,
  banner_url text,
  banner_theme text default 'cyberpunk',
  is_creator boolean not null default false,
  creator_earnings numeric not null default 0,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are viewable by authenticated users" on public.profiles;
create policy "profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

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
  on public.trust_log for select to authenticated using (auth.uid() = user_id);

drop policy if exists "users insert own trust log" on public.trust_log;
create policy "users insert own trust log"
  on public.trust_log for insert to authenticated with check (auth.uid() = user_id);

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

-- ---------- CHAT & REPORTS (DISCONNECT & AI LOCK) ----------
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  compatibility int,
  compatibility_breakdown jsonb,
  is_locked boolean not null default false,
  locked_reason text,
  disconnect_type text, -- null | 'permanent' | 'temporary_24h' | 'temporary_7d'
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  constraint different_users check (user_a <> user_b)
);

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='chats' and column_name='is_locked') then
    alter table public.chats add column is_locked boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='chats' and column_name='locked_reason') then
    alter table public.chats add column locked_reason text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='chats' and column_name='disconnect_type') then
    alter table public.chats add column disconnect_type text;
  end if;
end $$;

alter table public.chats enable row level security;

drop policy if exists "participants can view their chats" on public.chats;
create policy "participants can view their chats"
  on public.chats for select to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "authenticated users can create a chat they're part of" on public.chats;
create policy "authenticated users can create a chat they're part of"
  on public.chats for insert to authenticated
  with check (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "participants can update their chats" on public.chats;
create policy "participants can update their chats"
  on public.chats for update to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

create table if not exists public.chat_reports (
  id bigserial primary key,
  chat_id uuid not null references public.chats(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  ai_verdict text,
  status text not null default 'locked_for_review',
  created_at timestamptz not null default now()
);
alter table public.chat_reports enable row level security;

drop policy if exists "reports viewable by participants" on public.chat_reports;
create policy "reports viewable by participants" on public.chat_reports for select to authenticated
  using (auth.uid() = reporter_id or auth.uid() = reported_user_id);

drop policy if exists "users can create reports" on public.chat_reports;
create policy "users can create reports" on public.chat_reports for insert to authenticated
  with check (auth.uid() = reporter_id);

create table if not exists public.messages (
  id bigserial primary key,
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  kind text not null default 'text', -- 'text' | 'image' | 'video' | 'file'
  media_url text,
  file_name text,
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

-- ---------- RANNEWS SOCIAL FEED ----------
create table if not exists public.rannews_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null default 'Người dùng RanMet',
  author_avatar text,
  content text not null,
  image_url text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.rannews_posts enable row level security;

drop policy if exists "posts viewable by authenticated users" on public.rannews_posts;
create policy "posts viewable by authenticated users"
  on public.rannews_posts for select to authenticated using (true);

drop policy if exists "users can create posts" on public.rannews_posts;
create policy "users can create posts"
  on public.rannews_posts for insert to authenticated with check (auth.uid() = author_id);

drop policy if exists "users can delete own posts" on public.rannews_posts;
create policy "users can delete own posts"
  on public.rannews_posts for delete to authenticated using (auth.uid() = author_id);

create table if not exists public.rannews_likes (
  post_id uuid not null references public.rannews_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.rannews_likes enable row level security;

drop policy if exists "post likes viewable by everyone" on public.rannews_likes;
create policy "post likes viewable by everyone" on public.rannews_likes for select to authenticated using (true);

drop policy if exists "users can toggle post likes" on public.rannews_likes;
create policy "users can toggle post likes" on public.rannews_likes for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users can delete post likes" on public.rannews_likes;
create policy "users can delete post likes" on public.rannews_likes for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.rannews_comments (
  id bigserial primary key,
  post_id uuid not null references public.rannews_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.rannews_comments enable row level security;

drop policy if exists "post comments viewable by everyone" on public.rannews_comments;
create policy "post comments viewable by everyone" on public.rannews_comments for select to authenticated using (true);

drop policy if exists "users can comment on posts" on public.rannews_comments;
create policy "users can comment on posts" on public.rannews_comments for insert to authenticated with check (auth.uid() = user_id);

-- ---------- RANVIDEO REAL DATABASE ----------
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id) on delete cascade,
  creator_name text not null default 'RanMet Creator',
  creator_handle text not null default '@creator',
  avatar_letter text not null default 'R',
  caption text not null,
  video_url text not null,
  song_title text not null default 'Original Sound - RanMet',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.videos enable row level security;

drop policy if exists "videos viewable by everyone" on public.videos;
create policy "videos viewable by everyone" on public.videos for select to authenticated using (true);

drop policy if exists "users can post videos" on public.videos;
create policy "users can post videos" on public.videos for insert to authenticated with check (true);

drop policy if exists "users can delete own videos" on public.videos;
create policy "users can delete own videos" on public.videos for delete to authenticated using (auth.uid() = creator_id);

create table if not exists public.video_likes (
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (video_id, user_id)
);
alter table public.video_likes enable row level security;

drop policy if exists "video likes viewable by everyone" on public.video_likes;
create policy "video likes viewable by everyone" on public.video_likes for select to authenticated using (true);

drop policy if exists "users can toggle likes" on public.video_likes;
create policy "users can toggle likes" on public.video_likes for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users can delete own likes" on public.video_likes;
create policy "users can delete own likes" on public.video_likes for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.video_comments (
  id bigserial primary key,
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.video_comments enable row level security;

drop policy if exists "comments viewable by everyone" on public.video_comments;
create policy "comments viewable by everyone" on public.video_comments for select to authenticated using (true);

drop policy if exists "users can comment" on public.video_comments;
create policy "users can comment" on public.video_comments for insert to authenticated with check (auth.uid() = user_id);

-- ---------- RANWORLD REAL DATABASE ----------
create table if not exists public.world_rooms (
  id text primary key,
  name text not null,
  description text not null default '',
  category text not null default 'Gaming',
  creator_id uuid references public.profiles(id) on delete set null,
  host_name text not null default 'RanMet Host',
  is_voice boolean not null default true,
  tags text[] not null default '{}',
  color text not null default '#ec4899',
  created_at timestamptz not null default now()
);
alter table public.world_rooms enable row level security;

drop policy if exists "world rooms viewable by everyone" on public.world_rooms;
create policy "world rooms viewable by everyone" on public.world_rooms for select to authenticated using (true);

drop policy if exists "users can create rooms" on public.world_rooms;
create policy "users can create rooms" on public.world_rooms for insert to authenticated with check (true);

create table if not exists public.world_messages (
  id bigserial primary key,
  room_id text not null references public.world_rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  sender_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.world_messages enable row level security;

drop policy if exists "world messages viewable by everyone" on public.world_messages;
create policy "world messages viewable by everyone" on public.world_messages for select to authenticated using (true);

drop policy if exists "users can post world messages" on public.world_messages;
create policy "users can post world messages" on public.world_messages for insert to authenticated with check (auth.uid() = sender_id);

-- ---------- REFERRALS ----------
create table if not exists public.referrals (
  id bigserial primary key,
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_user_id uuid not null references public.profiles(id) on delete cascade,
  reward_claimed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (referrer_id, referred_user_id)
);
alter table public.referrals enable row level security;

drop policy if exists "referrals viewable by authenticated users" on public.referrals;
create policy "referrals viewable by authenticated users"
  on public.referrals for select to authenticated using (true);

drop policy if exists "users can record referrals" on public.referrals;
create policy "users can record referrals"
  on public.referrals for insert to authenticated with check (auth.uid() = referred_user_id or auth.uid() = referrer_id);

-- ---------- REALTIME SUBSCRIPTIONS (IDEMPOTENT) ----------
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;

  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chats') then
    alter publication supabase_realtime add table public.chats;
  end if;

  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_reports') then
    alter publication supabase_realtime add table public.chat_reports;
  end if;

  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'world_messages') then
    alter publication supabase_realtime add table public.world_messages;
  end if;

  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'video_comments') then
    alter publication supabase_realtime add table public.video_comments;
  end if;

  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'video_likes') then
    alter publication supabase_realtime add table public.video_likes;
  end if;

  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rannews_posts') then
    alter publication supabase_realtime add table public.rannews_posts;
  end if;

  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rannews_comments') then
    alter publication supabase_realtime add table public.rannews_comments;
  end if;

  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rannews_likes') then
    alter publication supabase_realtime add table public.rannews_likes;
  end if;
end $$;
