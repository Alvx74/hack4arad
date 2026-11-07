-- =====================================================================
-- Arad Explorer: leaderboard + "first blood"
--
-- Run once in Supabase → SQL Editor (safe to run again).
--
-- Scoring
--   * Each place counts with the player's best score there
--     (1 point per correct answer).
--   * First blood: the player's FIRST attempt at a place had every
--     question right. That place then counts double.
--
-- Security
--   * Players can read only their own rows in place_results.
--   * Writes go only through record_place_result(), which uses the
--     signed-in user's id (auth.uid()), so nobody can write for someone else.
--   * get_leaderboard() returns display names and totals only: no e-mails,
--     no user ids.
-- =====================================================================

create table if not exists public.place_results (
  user_id     uuid        not null references auth.users (id) on delete cascade,
  place_id    text        not null,             -- id from data/game-data.json, e.g. 'biserica-rosie'
  best_score  int         not null default 0,
  max_score   int         not null,             -- number of questions at that place
  first_score int         not null,             -- score of the first attempt
  first_blood boolean     not null default false,
  attempts    int         not null default 1,
  first_at    timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, place_id)
);

alter table public.place_results enable row level security;

drop policy if exists "place_results: read own" on public.place_results;
create policy "place_results: read own"
  on public.place_results for select
  using (auth.uid() = user_id);
-- No insert/update/delete policies on purpose: see record_place_result().


-- Called by the app after every finished quiz at a place.
-- The first call for a (player, place) decides first blood; later calls
-- only raise the best score and count attempts.
create or replace function public.record_place_result(p_place_id text, p_score int, p_max int)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  r   public.place_results;
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  if p_place_id is null or length(p_place_id) > 80
     or p_max is null or p_max < 1 or p_max > 20
     or p_score is null or p_score < 0 or p_score > p_max then
    raise exception 'invalid result';
  end if;

  insert into public.place_results as pr (user_id, place_id, best_score, max_score, first_score, first_blood)
  values (uid, p_place_id, p_score, p_max, p_score, p_score = p_max)
  on conflict (user_id, place_id) do update
    set best_score = greatest(pr.best_score, excluded.best_score),
        max_score  = excluded.max_score,
        attempts   = pr.attempts + 1,
        updated_at = now()
  returning * into r;

  return json_build_object(
    'first_attempt', r.attempts = 1,
    'first_blood',   r.first_blood,
    'best_score',    r.best_score
  );
end;
$$;

revoke all on function public.record_place_result(text, int, int) from public;
grant execute on function public.record_place_result(text, int, int) to authenticated;


-- One row per player: name, number of first bloods, total score.
-- The app adds the rank, depending on the chosen sort.
create or replace function public.get_leaderboard()
returns table (username text, first_bloods int, score int, is_me boolean)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''), 'Explorator') as username,
    (count(*) filter (where r.first_blood))::int                                       as first_bloods,
    sum(case when r.first_blood then r.best_score * 2 else r.best_score end)::int      as score,
    r.user_id = auth.uid()                                                             as is_me
  from public.place_results r
  join auth.users u on u.id = r.user_id
  group by r.user_id, u.raw_user_meta_data
  order by score desc, first_bloods desc;
$$;

revoke all on function public.get_leaderboard() from public;
grant execute on function public.get_leaderboard() to authenticated;
