"""
Script para vectorizar textos legales en Supabase usando embeddings de un modelo de lenguaje.

# PASO PREVIO REQUERIDO
Antes de ejecutar este script, ejecuta el siguiente comando SQL en tu editor de Supabase para agregar la columna vectorial:

-- Asegúrate de que la extensión pgvector esté habilitada en tu base de datos.
ALTER TABLE bibliotecalegal
ADD COLUMN embedding vector(768); -- El tamaño (768) puede variar según el modelo de embedding

"""

import os
import sys
import time
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import List

# Usar Google Generative Language API (google.generativeai) para embeddings
import google.generativeai as genai

# Configuración
CHUNK_SIZE = 2000  # caracteres por fragmento
EMBEDDING_MODEL = "models/embedding-001"  # Modelo de Google
VECTOR_SIZE = 768  # El modelo embedding-001 de Google retorna 768 dimensiones
BATCH_SIZE = 20

# Configuración directa de credenciales (no usar .env)
SUPABASE_URL = "https://zaidbrwtevakbuaowfrw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphaWRicnd0ZXZha2J1YW93ZnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjEyMzQyNSwiZXhwIjoyMDYxNjk5NDI1fQ.ylfYOcmACq6iKXnwyHRzXivyev1sCV5QY1p5XxsaTs8"
GOOGLE_API_KEY = "AIzaSyAD5ZPwCvSyaQbcgwh_fQ6otMqcs0b8dfk"

genai.configure(api_key=GOOGLE_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE) -> List[str]:
    """Divide el texto en fragmentos de tamaño manejable."""
    text = text or ""
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)] if text else []

def get_embedding(text: str) -> List[float]:
    """Obtiene el embedding para un texto usando la API de Google Generative Language."""
    response = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_document"
    )
    return response['embedding']

def average_embeddings(embeddings: List[List[float]]) -> List[float]:
    """Promedia una lista de vectores de embedding."""
    if not embeddings:
        return [0.0] * VECTOR_SIZE
    return list(np.mean(embeddings, axis=0))

def count_total_rows():
    """Cuenta el total de registros en la tabla bibliotecalegal."""
    response = supabase.table("bibliotecalegal").select("id", count="exact").execute()
    if hasattr(response, 'count'):
        return response.count
    return response["count"]

def count_pending_rows():
    """Cuenta el total de registros sin embedding."""
    response = supabase.table("bibliotecalegal").select("id", count="exact").is_("embedding", None).execute()
    if hasattr(response, 'count'):
        return response.count
    return response["count"]

def fetch_rows_to_vectorize(batch_size: int = BATCH_SIZE):
    """Obtiene un lote de filas sin embedding de la tabla bibliotecalegal."""
    response = supabase.table("bibliotecalegal").select("id, texto_limpio").is_("embedding", None).limit(batch_size).execute()
    return response.data if hasattr(response, 'data') else response["data"]

def update_embedding(row_id: int, embedding: List[float]):
    """Actualiza la columna embedding para la fila dada."""
    supabase.table("bibliotecalegal").update({"embedding": embedding}).eq("id", row_id).execute()

def main():
    total_rows = count_total_rows()
    pending_rows = count_pending_rows()
    total_vectorizadas = total_rows - pending_rows
    print(f"[INICIO] Total registros en la tabla: {total_rows}")
    print(f"[INICIO] Registros pendientes de vectorizar: {pending_rows}")
    while True:
        rows = fetch_rows_to_vectorize(BATCH_SIZE)
        if not rows:
            print("[INFO] No quedan normas pendientes de vectorizar.")
            break
        for row in rows:
            row_id = row["id"]
            texto = row.get("texto_limpio")
            if not texto or not isinstance(texto, str) or not texto.strip():
                print(f"[WARN] id={row_id} no tiene texto_limpio. Se salta.")
                continue
            chunks = chunk_text(texto)
            embeddings = []
            for i, chunk in enumerate(chunks):
                try:
                    emb = get_embedding(chunk)
                    embeddings.append(emb)
                    time.sleep(0.5)  # Evita rate limit
                except Exception as e:
                    print(f"[ERROR] Fallo embedding en chunk {i+1}/{len(chunks)} para id={row_id}: {e}")
            if embeddings:
                avg_emb = average_embeddings(embeddings)
                update_embedding(row_id, avg_emb)
                total_vectorizadas += 1
                pct = (total_vectorizadas / total_rows) * 100 if total_rows else 100
                print(f"[OK] id={row_id} vectorizado y actualizado. Progreso: {total_vectorizadas}/{total_rows} ({pct:.2f}%)")
            else:
                print(f"[WARN] id={row_id} no pudo ser vectorizado.")
        pendientes_actual = count_pending_rows()
        total_vectorizadas = total_rows - pendientes_actual
        pct = (total_vectorizadas / total_rows) * 100 if total_rows else 100
        print(f"[PROGRESO] Procesadas: {total_vectorizadas}/{total_rows} ({pct:.2f}%) - Pendientes: {pendientes_actual}")
        time.sleep(1)

if __name__ == "__main__":
    main()
