-- Function to normalize a RUT value: remove dots and dashes, uppercase DV
CREATE OR REPLACE FUNCTION public.normalize_rut(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE WHEN $1 IS NULL THEN NULL ELSE UPPER(REPLACE(REPLACE($1, '.', ''), '-', '')) END;
$$;

-- Trigger function to normalize RUT on INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.organizaciones_normalize_rut_trg()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.rut IS NOT NULL THEN
    NEW.rut := public.normalize_rut(NEW.rut);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on organizaciones table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_organizaciones_normalize_rut'
      AND c.relname = 'organizaciones'
      AND n.nspname = 'public'
  ) THEN
    CREATE TRIGGER trg_organizaciones_normalize_rut
    BEFORE INSERT OR UPDATE OF rut ON public.organizaciones
    FOR EACH ROW EXECUTE FUNCTION public.organizaciones_normalize_rut_trg();
  END IF;
END $$;

-- Optional one-time backfill to normalize existing rows
-- Uncomment to run once if needed
-- UPDATE public.organizaciones SET rut = public.normalize_rut(rut) WHERE rut IS NOT NULL;
