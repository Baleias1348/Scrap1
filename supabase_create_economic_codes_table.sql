-- SQL script to create a table for Chilean economic activity codes in Supabase
CREATE TABLE IF NOT EXISTS public.codigos_actividad_economica_sii_chile (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL,
    descripcion TEXT NOT NULL,
    afecto_iva VARCHAR(10),
    categoria_tributaria VARCHAR(50),
    disponible_internet VARCHAR(10),
    embedding VECTOR(768) -- OpenAI embedding vector size
);

-- Optional: create an index for semantic search
CREATE INDEX IF NOT EXISTS idx_economic_codes_embedding ON public.codigos_actividad_economica_sii_chile USING ivfflat (embedding vector_cosine_ops);
