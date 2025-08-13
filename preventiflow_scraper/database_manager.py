import os
from dotenv import load_dotenv

# Cargar .env desde el raíz del proyecto (un nivel arriba de este archivo)
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)

# Compatibilidad: si SUPABASE_KEY no está, usar SUPABASE_SERVICE_ROLE_KEY
if not os.environ.get("SUPABASE_KEY") and os.environ.get("SUPABASE_SERVICE_ROLE_KEY"):
    os.environ["SUPABASE_KEY"] = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
import uuid
import datetime
import json
from typing import List, Dict
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("[ADVERTENCIA] Variables de entorno SUPABASE_URL y SUPABASE_KEY no definidas. Solo se guardará localmente.")

def save_result(resultados: List[Dict], strategy_name: str):
    now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    outdir = os.path.join(os.path.dirname(__file__), "results")
    os.makedirs(outdir, exist_ok=True)
    filename = f"{strategy_name.replace(' ', '_').lower()}_{now}.json"
    path = os.path.join(outdir, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)
    print(f"[INFO] Resultado exportado local: {path}")

    if supabase:
        campos_validos = [
            "fuente", "nombre_norma", "jerarquia", "descripcion", "palabras_clave",
            "url_publica", "url_fuente_datos", "texto_limpio", "json_crudo", "comentarios_experto", "motivo_error"
        ]
        for res in resultados:
            registro = {k: v for k, v in res.items() if k in campos_validos}
            # Soporte para campo de error
            if res.get("status") == "error":
                registro["motivo_error"] = res.get("texto_limpio") or "Error desconocido"
                registro["texto_limpio"] = None
                registro["json_crudo"] = None
            else:
                registro["motivo_error"] = None
            # Serializar json_crudo si es necesario
            if "json_crudo" in registro:
                import collections.abc
                if isinstance(registro["json_crudo"], (str, bytes)):
                    try:
                        registro["json_crudo"] = json.loads(registro["json_crudo"])
                    except Exception:
                        registro["json_crudo"] = None
                elif not isinstance(registro["json_crudo"], collections.abc.Mapping):
                    registro["json_crudo"] = None
            print("[DEBUG] Registro a insertar en Supabase:")
            print(json.dumps(registro, indent=2, ensure_ascii=False))

            # --- Lógica para evitar duplicados y solo actualizar si hay datos exitosos ---
            nombre_norma = registro.get("nombre_norma")
            existe = False
            if nombre_norma:
                query = supabase.table("bibliotecalegal").select("id, texto_limpio, json_crudo").eq("nombre_norma", nombre_norma).execute()
                registros_existentes = query.data if hasattr(query, 'data') else query["data"]
                existe = registros_existentes and len(registros_existentes) > 0

            es_exitoso = registro.get("texto_limpio") not in [None, ""] and registro.get("json_crudo") not in [None, ""]

            if existe:
                if es_exitoso:
                    # Actualizar solo si el nuevo resultado es exitoso
                    id_existente = registros_existentes[0]["id"]
                    print(f"[INFO] Actualizando registro existente para '{nombre_norma}' (id={id_existente})")
                    data, error = supabase.table("bibliotecalegal").update(registro).eq("id", id_existente).execute()
                    if error:
                        print(f"[ERROR] Falló actualización en Supabase para {nombre_norma}: {error}")
                    else:
                        print(f"[INFO] Registro actualizado en Supabase: {nombre_norma}")
                else:
                    print(f"[INFO] Registro existente para '{nombre_norma}' no se actualiza porque el nuevo resultado es error o nulo.")
                continue  # No insertar duplicado
            else:
                if es_exitoso or registro.get("motivo_error"):
                    print(f"[INFO] Insertando nuevo registro para '{nombre_norma}'")
                    data, error = supabase.table("bibliotecalegal").insert(registro).execute()
                    if error:
                        print(f"[ERROR] Falló inserción en Supabase para {nombre_norma}: {error}")
                    else:
                        print(f"[INFO] Registro insertado en Supabase: {nombre_norma}")
                else:
                    print(f"[INFO] No se inserta registro para '{nombre_norma}' porque el resultado es nulo y sin error.")
    else:
        print("[INFO] Saltando guardado en Supabase por falta de configuración.")
