-- SQL command to import CSV data into the codigos_actividad_economica_sii_chile table
-- Adjust the file path as needed for your Supabase environment
COPY public.codigos_actividad_economica_sii_chile (codigo, descripcion, afecto_iva, categoria_tributaria, disponible_internet)
FROM '/app/codigos_actividad_economica_sii_chile.csv'
DELIMITER ','
CSV HEADER;
