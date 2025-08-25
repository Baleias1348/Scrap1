-- Migration: add optional fields to organizaciones
-- Safely add columns if they do not already exist
DO $$
BEGIN
  -- razon_social
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'organizaciones' AND column_name = 'razon_social'
  ) THEN
    ALTER TABLE public.organizaciones ADD COLUMN razon_social text;
  END IF;

  -- rut (no unique constraint yet; validation happens at app layer)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'organizaciones' AND column_name = 'rut'
  ) THEN
    ALTER TABLE public.organizaciones ADD COLUMN rut text;
  END IF;

  -- actividad_economica
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'organizaciones' AND column_name = 'actividad_economica'
  ) THEN
    ALTER TABLE public.organizaciones ADD COLUMN actividad_economica text;
  END IF;

  -- direccion
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'organizaciones' AND column_name = 'direccion'
  ) THEN
    ALTER TABLE public.organizaciones ADD COLUMN direccion text;
  END IF;

  -- encargado_nombre
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'organizaciones' AND column_name = 'encargado_nombre'
  ) THEN
    ALTER TABLE public.organizaciones ADD COLUMN encargado_nombre text;
  END IF;

  -- encargado_apellido
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'organizaciones' AND column_name = 'encargado_apellido'
  ) THEN
    ALTER TABLE public.organizaciones ADD COLUMN encargado_apellido text;
  END IF;
END $$;
