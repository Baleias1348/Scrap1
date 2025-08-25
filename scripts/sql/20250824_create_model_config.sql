-- Create flexible model_config table to store JSON configuration by agent/key
create table if not exists public.model_config (
  id text primary key, -- e.g., 'aria'
  config jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.model_config_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_model_config_updated_at on public.model_config;
create trigger trg_model_config_updated_at
before update on public.model_config
for each row execute procedure public.model_config_set_updated_at();

-- Seed/Upsert ARIA default config
insert into public.model_config(id, config)
values (
  'aria',
  '{
    "chat": {
      "model": "gpt-4.1-turbo",
      "mode": "streaming",
      "description": "Usado para la ventana de chat en el dashboard. Respuestas rápidas, naturales y con streaming token a token."
    },
    "fast_interactions": {
      "model": "gpt-4.1-mini",
      "mode": "standard",
      "description": "Usado para interacciones simples, FAQs y guías rápidas. Prioriza velocidad y bajo costo."
    },
    "compliance": {
      "model": "gpt-o1-mini",
      "mode": "standard",
      "description": "Usado para validación legal, compliance, PRL y documentos normativos. Respuestas más profundas y con rigor."
    },
    "documents": {
      "model": "gpt-4.1",
      "mode": "standard",
      "description": "Usado para creación, personalización y adaptación de plantillas de documentos a rubros, tamaño de empresa o región geográfica."
    }
  }'::jsonb
)
on conflict (id) do update set config = excluded.config, updated_at = now();
