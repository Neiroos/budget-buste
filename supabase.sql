-- Budget a Buste - tabella e regole di accesso.
-- Da incollare in Supabase: menu a sinistra "SQL Editor" -> "New query" -> incolla -> Run.
-- Si puo' rieseguire piu' volte senza danni.

create table if not exists public.budget (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb  not null,
  updated_at bigint not null default 0
);

-- Nessuno vede niente se non e' una regola a permetterlo.
alter table public.budget enable row level security;

drop policy if exists "legge solo la propria riga"      on public.budget;
drop policy if exists "crea solo la propria riga"       on public.budget;
drop policy if exists "aggiorna solo la propria riga"   on public.budget;
drop policy if exists "cancella solo la propria riga"   on public.budget;

create policy "legge solo la propria riga"    on public.budget for select using (auth.uid() = user_id);
create policy "crea solo la propria riga"     on public.budget for insert with check (auth.uid() = user_id);
create policy "aggiorna solo la propria riga" on public.budget for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cancella solo la propria riga" on public.budget for delete using (auth.uid() = user_id);

-- Chi non ha fatto l'accesso non puo' toccare nulla.
revoke all on public.budget from anon;
grant select, insert, update, delete on public.budget to authenticated;
