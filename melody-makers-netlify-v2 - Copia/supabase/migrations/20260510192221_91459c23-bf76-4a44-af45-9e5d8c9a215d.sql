-- ============ ENUMS ============
create type public.app_role as enum ('admin', 'banda');
create type public.event_status as enum ('confirmed', 'pending', 'cancelled', 'done');
create type public.event_type as enum ('religious', 'civil', 'mixed');
create type public.song_genre as enum ('catholic', 'classical', 'pop', 'gospel', 'mpb', 'jazz', 'soul');
create type public.selected_by as enum ('band', 'couple');
create type public.event_song_status as enum ('planned', 'played', 'skipped', 'replaced');
create type public.suggestion_status as enum ('pending', 'approved', 'rejected');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_band_member(_user_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','banda'))
$$;

-- ============ EVENTS ============
create table public.events (
  id uuid primary key default gen_random_uuid(),
  couple_name text not null,
  event_date date not null,
  event_time time,
  venue text,
  city text,
  status public.event_status not null default 'pending',
  event_type public.event_type default 'religious',
  formation text,
  fee numeric(10,2),
  contact_phone text,
  contact_whatsapp text,
  contact_email text,
  access_code text not null unique,
  selection_deadline date,
  couple_notes text,
  internal_notes text,
  stars_rating int check (stars_rating between 1 and 5),
  testimonial text,
  photos jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.events enable row level security;
create index events_date_idx on public.events(event_date);
create index events_access_code_idx on public.events(access_code);

-- ============ SONGS ============
create table public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text,
  genre public.song_genre,
  moments text[] default '{}',
  original_key text,
  band_key text,
  youtube_url text,
  sheet_url text,
  arrangement_notes text,
  times_played int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.songs enable row level security;

-- ============ EVENT SONGS ============
create table public.event_songs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  moment text not null,
  order_index int not null default 0,
  custom_key text,
  selected_by public.selected_by not null default 'band',
  status public.event_song_status not null default 'planned',
  created_at timestamptz not null default now()
);
alter table public.event_songs enable row level security;
create index event_songs_event_idx on public.event_songs(event_id);

-- ============ SONG SUGGESTIONS ============
create table public.song_suggestions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  song_title text not null,
  artist text,
  moment text,
  couple_notes text,
  status public.suggestion_status not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.song_suggestions enable row level security;

-- ============ REHEARSALS ============
create table public.rehearsals (
  id uuid references public.events(id) on delete set null,
  id_pk uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete set null,
  rehearsal_date date not null,
  rehearsal_time time,
  location text,
  members_present text[] default '{}',
  agenda uuid[] default '{}',
  notes text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
-- Drop the duplicate id column added by mistake
alter table public.rehearsals drop column id;
alter table public.rehearsals rename column id_pk to id;
alter table public.rehearsals enable row level security;

-- ============ TRIGGER: updated_at ============
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger trg_events_touch before update on public.events
  for each row execute function public.touch_updated_at();
create trigger trg_songs_touch before update on public.songs
  for each row execute function public.touch_updated_at();

-- ============ TRIGGER: novo usuário -> profile + role ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email);

  insert into public.user_roles (user_id, role)
  values (new.id, 'banda')
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ RLS POLICIES ============

-- profiles
create policy "profiles select own" on public.profiles
  for select using (auth.uid() = id or public.is_band_member(auth.uid()));
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

-- user_roles (read-only via has_role; only admins manage)
create policy "user_roles select self" on public.user_roles
  for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "user_roles admin manage" on public.user_roles
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- events: banda gerencia tudo; público lê apenas via access_code (consultado no client)
create policy "events band all" on public.events
  for all using (public.is_band_member(auth.uid()))
  with check (public.is_band_member(auth.uid()));
create policy "events public read by code" on public.events
  for select using (true); -- portal público precisa achar pelo code; código atua como segredo

-- songs: banda gerencia, público lê para portal noivos
create policy "songs band all" on public.songs
  for all using (public.is_band_member(auth.uid()))
  with check (public.is_band_member(auth.uid()));
create policy "songs public read" on public.songs
  for select using (is_active = true);

-- event_songs: banda gerencia; público lê (portal noivos vê o roteiro)
create policy "event_songs band all" on public.event_songs
  for all using (public.is_band_member(auth.uid()))
  with check (public.is_band_member(auth.uid()));
create policy "event_songs public read" on public.event_songs
  for select using (true);
-- noivos podem inserir suas próprias seleções (selected_by='couple')
create policy "event_songs public insert couple" on public.event_songs
  for insert with check (selected_by = 'couple');
create policy "event_songs public delete couple" on public.event_songs
  for delete using (selected_by = 'couple');

-- song_suggestions: banda gerencia; público pode inserir e ler
create policy "suggestions band all" on public.song_suggestions
  for all using (public.is_band_member(auth.uid()))
  with check (public.is_band_member(auth.uid()));
create policy "suggestions public read" on public.song_suggestions
  for select using (true);
create policy "suggestions public insert" on public.song_suggestions
  for insert with check (status = 'pending');

-- rehearsals: somente banda
create policy "rehearsals band all" on public.rehearsals
  for all using (public.is_band_member(auth.uid()))
  with check (public.is_band_member(auth.uid()));
