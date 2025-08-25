-- Create table to persist chat session rolling summaries
-- Safe to run multiple times
create table if not exists public.session_summaries (
  session_id text primary key,
  summary text not null default '',
  updated_at timestamptz not null default now()
);

-- Update trigger to keep updated_at fresh
create or replace function public.session_summaries_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_session_summaries_updated_at on public.session_summaries;
create trigger trg_session_summaries_updated_at
before update on public.session_summaries
for each row execute procedure public.session_summaries_set_updated_at();

-- Helpful index for housekeeping queries
create index if not exists idx_session_summaries_updated_at on public.session_summaries(updated_at desc);
