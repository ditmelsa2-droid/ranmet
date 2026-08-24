-- ============================================================
-- RanMet — Full Production Schema for Supabase (Postgres)
-- Chạy toàn bộ file này trong Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

-- 1. Cấp quyền truy cập Schema và Bảng cho các role của Supabase
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

-- ---------- RANVIDEO REAL DATABASE ----------
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id) on delete set null,
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
create policy "users can post videos" on public.videos for insert to authenticated with check (auth.uid() = creator_id);

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

-- ---------- REALTIME ENABLING ----------
-- Bật Realtime cho tất cả các bảng tương tác thời gian thực
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.chats;
alter publication supabase_realtime add table public.world_messages;
alter publication supabase_realtime add table public.video_comments;
alter publication supabase_realtime add table public.video_likes;

-- ---------- SEED DATA CHÍNH THỨC VÀO DATABASE ----------
insert into public.world_rooms (id, name, description, category, host_name, is_voice, tags, color)
values
  ('minecraft-builders', 'Thế Giới Minecraft & Builders ⛏️', 'Cộng đồng chia sẻ công trình, server multiplayer và mẹo sinh tồn backrooms.', 'Gaming', 'Kaito_Gamer', true, array['Minecraft', 'Survival', 'Redstone'], '#10b981'),
  ('anime-lounge', 'Góc Wibu & Anime Mùa Mới ✨', 'Thảo luận các bộ Anime hot, cosplay, manga và art phong cách Cyber.', 'Anime', 'VyVy_Anime', false, array['Anime', 'Manga', 'Cosplay'], '#ec4899'),
  ('dev-ai-hub', 'Dev & AI Creators Space 💻', 'Nơi quy tụ các lập trình viên Next.js, Supabase, Python AI và Indie Hackers.', 'Công nghệ', 'LinhChi_Dev', true, array['Next.js', 'AI', 'Fullstack'], '#06b6d4'),
  ('chill-lofi-room', 'Tâm Sự Đêm Khuya & Lofi Beats ☕', 'Phòng nghe nhạc chill, trò chuyện tâm sự nhẹ nhàng sau những giờ làm việc mệt mỏi.', 'Âm nhạc', 'MinhQuan', true, array['Lofi', 'Chill', 'TamSu'], '#a855f7'),
  ('travel-food', 'Hội Mê Du Lịch & Ẩm Thực 🍜', 'Chia sẻ các địa điểm check-in, quán cafe đẹp và review đồ ăn ngon toàn quốc.', 'Đời sống', 'HaMy', false, array['Foodie', 'Travel', 'Cafe'], '#f59e0b')
on conflict (id) do nothing;

insert into public.videos (id, creator_name, creator_handle, avatar_letter, caption, video_url, song_title, tags)
values
  ('11111111-1111-1111-1111-111111111111', 'LinhChi_Dev', '@linhchi.codes', 'L', 'Setup góc làm việc lập trình cyberpunk ban đêm cực chill ✨💻 #developer #cyberpunk #setup', 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-at-night-42247-large.mp4', 'Lofi Chill Beats - RanMet Audio', array['#setup', '#coding', '#chill']),
  ('22222222-2222-2222-2222-222222222222', 'Kaito_Gamer', '@kaito.gaming', 'K', 'Thử thách sinh tồn Minecraft 100 ngày trong thế giới ngầm Backrooms! ⛏️👹 #minecraft #gaming', 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4', 'Epic Gaming Synthwave - Kaito Sound', array['#minecraft', '#survival', '#backrooms']),
  ('33333333-3333-3333-3333-333333333333', 'VyVy_Anime', '@vyvy.art', 'V', 'Vẽ nhân vật anime theo phong cách Cyber Neon 3D trong 1 tiếng 🎨✨ #anime #digitalart', 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-and-skyscrapers-41584-large.mp4', 'Anime Future Bass - VyVy Track', array['#anime', '#drawing', '#art'])
on conflict (id) do nothing;

-- Đồng bộ dữ liệu profiles cho các tài khoản hiện có
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

insert into public.trust_scores (user_id)
select id from public.profiles
on conflict (user_id) do nothing;
