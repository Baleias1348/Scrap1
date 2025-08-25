-- Add metadata column to constituciones_agente and unique index on nombre_agente
-- Safe guards: only create if not exists

-- 1) Add metadata jsonb column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'constituciones_agente'
      AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.constituciones_agente
      ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb NOT NULL;
  END IF;
END $$;

-- 2) Ensure fecha_actualizacion has a default (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'constituciones_agente'
      AND column_name = 'fecha_actualizacion'
  ) THEN
    ALTER TABLE public.constituciones_agente
      ADD COLUMN fecha_actualizacion timestamptz DEFAULT now();
  ELSE
    ALTER TABLE public.constituciones_agente
      ALTER COLUMN fecha_actualizacion SET DEFAULT now();
  END IF;
END $$;

-- 3) Create unique index on nombre_agente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'ux_constituciones_agente_nombre_agente'
  ) THEN
    CREATE UNIQUE INDEX ux_constituciones_agente_nombre_agente
      ON public.constituciones_agente (nombre_agente);
  END IF;
END $$;
