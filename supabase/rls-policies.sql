-- ============================================================
-- RLS POLICIES FOR FAMILY BONDS
-- Run this in Supabase SQL Editor (one shot)
-- ============================================================

-- ── Helper: check family membership ─────────────────────────
create or replace function is_family_member(fid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from family_members
    where family_id = fid and user_id = auth.uid()
  );
$$;

create or replace function is_family_admin(fid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from family_members
    where family_id = fid and user_id = auth.uid() and role = 'admin'
  );
$$;

-- ── Auto-create users row on signup ─────────────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop if exists so this script is re-runnable
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Backfill: create users rows for any existing auth users
insert into public.users (id, email, display_name)
select
  id,
  email,
  coalesce(raw_user_meta_data ->> 'display_name', split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
alter table users enable row level security;
alter table families enable row level security;
alter table family_members enable row level security;
alter table invites enable row level security;
alter table sprint_themes enable row level security;
alter table family_sprints enable row level security;
alter table activities enable row level security;
alter table responses enable row level security;
alter table comments enable row level security;
alter table reactions enable row level security;
alter table badges enable row level security;
alter table user_badges enable row level security;
alter table streaks enable row level security;
alter table family_xp enable row level security;
alter table memory_books enable row level security;

-- ============================================================
-- USERS
-- ============================================================
create policy "users_select_own"       on users for select using (id = auth.uid());
create policy "users_select_family"    on users for select using (
  exists (
    select 1 from family_members fm1
    join family_members fm2 on fm1.family_id = fm2.family_id
    where fm1.user_id = auth.uid() and fm2.user_id = users.id
  )
);
create policy "users_update_own"       on users for update using (id = auth.uid());
create policy "users_insert_own"       on users for insert with check (id = auth.uid());

-- ============================================================
-- FAMILIES
-- ============================================================
create policy "families_insert"        on families for insert with check (created_by = auth.uid());
create policy "families_select"        on families for select using (is_family_member(id));
create policy "families_select_creator" on families for select using (created_by = auth.uid());
create policy "families_update"        on families for update using (is_family_admin(id));

-- ============================================================
-- FAMILY_MEMBERS
-- ============================================================
create policy "family_members_select"  on family_members for select using (is_family_member(family_id));
create policy "family_members_insert"  on family_members for insert with check (
  -- Allow: you're inserting yourself as first member (creator) OR you're an admin adding someone
  (user_id = auth.uid())
  or is_family_admin(family_id)
);
create policy "family_members_update"  on family_members for update using (is_family_admin(family_id));
create policy "family_members_delete"  on family_members for delete using (
  is_family_admin(family_id) or user_id = auth.uid()
);

-- ============================================================
-- INVITES
-- ============================================================
create policy "invites_insert"         on invites for insert with check (is_family_admin(family_id));
create policy "invites_select_admin"   on invites for select using (is_family_admin(family_id));
create policy "invites_select_token"   on invites for select using (true);  -- anyone can look up by token (filtered in app)
create policy "invites_update"         on invites for update using (true);  -- mark used_at after accepting

-- ============================================================
-- SPRINT_THEMES  (read-only reference data)
-- ============================================================
create policy "sprint_themes_select"   on sprint_themes for select using (true);

-- ============================================================
-- FAMILY_SPRINTS
-- ============================================================
create policy "family_sprints_select"  on family_sprints for select using (is_family_member(family_id));
create policy "family_sprints_insert"  on family_sprints for insert with check (is_family_member(family_id));
create policy "family_sprints_update"  on family_sprints for update using (is_family_admin(family_id));

-- ============================================================
-- ACTIVITIES  (read-only reference data)
-- ============================================================
create policy "activities_select"      on activities for select using (true);

-- ============================================================
-- RESPONSES
-- ============================================================
create policy "responses_select"       on responses for select using (
  exists (
    select 1 from family_sprints fs
    where fs.id = responses.sprint_id and is_family_member(fs.family_id)
  )
);
create policy "responses_insert"       on responses for insert with check (
  user_id = auth.uid()
  and exists (
    select 1 from family_sprints fs
    where fs.id = sprint_id and is_family_member(fs.family_id)
  )
);

-- ============================================================
-- COMMENTS
-- ============================================================
create policy "comments_select"        on comments for select using (
  exists (
    select 1 from responses r
    join family_sprints fs on fs.id = r.sprint_id
    where r.id = comments.response_id and is_family_member(fs.family_id)
  )
);
create policy "comments_insert"        on comments for insert with check (
  user_id = auth.uid()
  and exists (
    select 1 from responses r
    join family_sprints fs on fs.id = r.sprint_id
    where r.id = response_id and is_family_member(fs.family_id)
  )
);

-- ============================================================
-- REACTIONS
-- ============================================================
create policy "reactions_select"       on reactions for select using (
  exists (
    select 1 from responses r
    join family_sprints fs on fs.id = r.sprint_id
    where r.id = reactions.response_id and is_family_member(fs.family_id)
  )
);
create policy "reactions_insert"       on reactions for insert with check (
  user_id = auth.uid()
  and exists (
    select 1 from responses r
    join family_sprints fs on fs.id = r.sprint_id
    where r.id = response_id and is_family_member(fs.family_id)
  )
);
create policy "reactions_delete"       on reactions for delete using (user_id = auth.uid());

-- ============================================================
-- BADGES  (read-only reference data)
-- ============================================================
create policy "badges_select"          on badges for select using (true);

-- ============================================================
-- USER_BADGES
-- ============================================================
create policy "user_badges_select"     on user_badges for select using (is_family_member(family_id));
create policy "user_badges_insert"     on user_badges for insert with check (is_family_member(family_id));

-- ============================================================
-- STREAKS
-- ============================================================
create policy "streaks_select"         on streaks for select using (is_family_member(family_id));
create policy "streaks_insert"         on streaks for insert with check (user_id = auth.uid() and is_family_member(family_id));
create policy "streaks_update"         on streaks for update using (user_id = auth.uid());

-- ============================================================
-- FAMILY_XP
-- ============================================================
create policy "family_xp_select"       on family_xp for select using (is_family_member(family_id));
create policy "family_xp_insert"       on family_xp for insert with check (is_family_member(family_id));
create policy "family_xp_update"       on family_xp for update using (is_family_member(family_id));

-- ============================================================
-- MEMORY_BOOKS
-- ============================================================
create policy "memory_books_select"    on memory_books for select using (
  exists (
    select 1 from family_sprints fs
    where fs.id = memory_books.sprint_id and is_family_member(fs.family_id)
  )
);
