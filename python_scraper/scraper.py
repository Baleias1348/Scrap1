import os
import sys
import time
import uuid
import json
import datetime
from typing import List, Dict, Any, Optional

import requests
import json
import sys
import os
import datetime

# --- FUNCIÓN PRINCIPAL DE EXTRACCIÓN ---
# --- FUNCIÓN PRINCIPAL DE EXTRACCIÓN CON CONTROL DE VIGENCIA CORREGIDO ---
def extraer_json_de_api(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }
    try:
        resp = requests.get(url, headers=headers, timeout=30)
        if resp.status_code != 200:
            print(f"[ERROR] Código de estado inesperado: {resp.status_code}")
            return None
        data = resp.json()
        # --- Validación flexible y robusta de vigencia ---
        vigencia_claves = ["esVigente", "estadoNorma", "vigencia"]
        valor_vigencia = None
        clave_encontrada = None
        id_norma = data.get("idNorma") or data.get("IdNorma") or "(sin id)"
        vigente = None
        # 1. Buscar en el nivel raíz
        for k in vigencia_claves:
            if k in data:
                valor_vigencia = data[k]
                clave_encontrada = k
                break
        # 2. Si no está en la raíz, buscar en el primer nivel de hijos
        if valor_vigencia is None:
            for v in data.values():
                if isinstance(v, dict):
                    for k in vigencia_claves:
                        if k in v:
                            valor_vigencia = v[k]
                            clave_encontrada = k
                            break
                if valor_vigencia is not None:
                    break
        # 3. Lógica robusta de validación
        if clave_encontrada == "vigencia" and isinstance(valor_vigencia, dict):
            fin_vigencia = valor_vigencia.get("fin_vigencia", None)
            if fin_vigencia in (None, "", "0000-00-00"):
                vigente = True
            else:
                vigente = False
        elif clave_encontrada == "esVigente":
            vigente = bool(valor_vigencia)
        elif clave_encontrada == "estadoNorma" and isinstance(valor_vigencia, str):
            if "VIGENTE" in valor_vigencia.upper():
                vigente = True
            elif "NO VIGENTE" in valor_vigencia.upper():
                vigente = False
        # 4. Decisión
        if vigente is True:
            return data
        elif vigente is False:
            print(f"ADVERTENCIA: La norma {id_norma} no está vigente (clave '{clave_encontrada}' = {valor_vigencia}) y será omitida.")
            return None
        else:
            print(f"AVISO: No se pudo verificar automáticamente la vigencia de la norma {id_norma}. Se procesará, pero requiere revisión manual.")
            return data
    except Exception as e:
        print(f"[ERROR] Falló la petición: {e}")
        return None

# --- GUARDADO DE RESULTADOS ---
def save_result(data, url):
    now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    basename = f"leychileapi_{now}.json"
    outdir = os.path.join(os.path.dirname(__file__), "results")
    os.makedirs(outdir, exist_ok=True)
    path = os.path.join(outdir, basename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"url": url, "data": data}, f, ensure_ascii=False, indent=2)
    print(f"[INFO] Resultado guardado en: {path}")

# --- MAIN ---
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python3 scraper.py <URL_API_LEYCHILE>")
        sys.exit(1)
    url = sys.argv[1]
    data = extraer_json_de_api(url)
    save_result(data, url)

from selenium_stealth import stealth
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from webdriver_manager.chrome import ChromeDriverManager
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURACIÓN INICIAL ---
# Carga las variables del .env
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Inicializa el cliente de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- FUNCIONES DE SOPORTE ---

def save_result(strategy: str, urls: List[str], data: List[Dict[str, Any]]):
    """Guarda el resultado en Supabase y exporta el JSON a un archivo local."""
    if not data:
        print("[ERROR] No hay datos para guardar.")
        return

    # Guardar en Supabase
    try:
        res = supabase.table('resultados_scraping').insert({
            "id": str(uuid.uuid4()),
            "estrategia_usada": strategy,
            "urls_procesadas": len(urls),
            "resultado_json": data, # Guardamos la lista completa de resultados
        }).execute()
        print(f"[SUPABASE] Resultado guardado exitosamente.")
    except Exception as e:
        print(f"[SUPABASE] Error al guardar en Supabase: {e}")

    # Guardar archivo local
    now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"results/{strategy}_{now}.json"
    os.makedirs("results", exist_ok=True)
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[LOCAL] Resultado exportado: {filename}")

def limpiar_texto(texto: str) -> str:
    """Función simple para limpiar texto de espacios extra."""
    lineas = (line.strip() for line in texto.splitlines())
    return '\n'.join(line for line in lineas if line)

# --- ESTRATEGIAS DE SCRAPING ---

def leychile_scraper(driver: webdriver.Chrome, url: str) -> dict:
    """
    Extrae el texto legal limpio desde el iframe de LeyChile o reporta un error claro.
    """
    print(f"--- Scraping LeyChile (todo o nada) para: {url} ---")
    try:
        driver.get(url)
        # Esperar y cambiar al iframe
        # Guardar HTML completo antes de buscar el iframe
        with open("debug_html_pre_iframe.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        # Guardar captura de pantalla antes de buscar el iframe
        screenshot_path = "/Users/hernanherreraacevedo/CascadeProjects/Scrap1/python_scraper/debug_screenshot_pre_iframe.png"
        result = driver.save_screenshot(screenshot_path)
        print(f"[DEBUG] Screenshot guardada: {result} en {screenshot_path}")
        try:
            WebDriverWait(driver, 60).until(
                EC.frame_to_be_available_and_switch_to_it((By.ID, "iFrmNorma"))
            )
        except TimeoutException:
            print(f"ERROR: Timeout esperando el iframe 'iFrmNorma' en {url}.")
            # Guardar HTML también si ocurre timeout
            with open("debug_html_pre_iframe.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            # Guardar captura de pantalla también si ocurre timeout
            screenshot_path = "/Users/hernanherreraacevedo/CascadeProjects/Scrap1/python_scraper/debug_screenshot_pre_iframe.png"
            result = driver.save_screenshot(screenshot_path)
            print(f"[DEBUG] Screenshot guardada (timeout): {result} en {screenshot_path}")
            return {"url": url, "status": "error", "content": "TimeoutException al buscar iframe iFrmNorma"}

        # Esperar y encontrar el contenido
        try:
            contenedor = WebDriverWait(driver, 60).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, "div#textoNorma"))
            )
        except TimeoutException:
            print(f"ERROR: Timeout esperando el contenido 'div#textoNorma' en {url}.")
            return {"url": url, "status": "error", "content": "TimeoutException al buscar div#textoNorma"}

        # Extraer el texto limpio
        texto = contenedor.get_attribute("innerText")
        texto_limpio = limpiar_texto(texto)
        print("DEBUG: Extracción exitosa.")
        return {"url": url, "status": "ok", "content": texto_limpio}
    except Exception as e:
        msg = f"Ocurrió un error inesperado: {e}"
        print(f"DEBUG: Exception: {msg}")
        return {"url": url, "status": "error", "content": str(e)}
    finally:
        # 4. CRUCIAL: Siempre volver al contexto principal
        driver.switch_to.default_content()


# --- FUNCIÓN PRINCIPAL ---

def main():
    if len(sys.argv) < 3:
        print("Uso: python scraper.py leychile <url1> [<url2> ...]")
        sys.exit(1)

    strategy = sys.argv[1]
    urls = sys.argv[2:]
    
    if strategy != "leychile":
        print(f"Estrategia no soportada: {strategy}. Solo se permite 'leychile'.")
        sys.exit(1)

    print(f"Iniciando scraping con estrategia: '{strategy}'...")

    options = webdriver.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    driver = uc.Chrome(options=options)

    # Aplicar selenium-stealth para evadir detección
    stealth(driver,
        languages=["es-ES", "es"],
        vendor="Google Inc.",
        platform="Win32",
        webgl_vendor="Intel Inc.",
        renderer="Intel Iris OpenGL Engine",
        fix_hairline=True,
    )

    all_results = []
    try:
        for url in urls:
            res = leychile_scraper(driver, url)
            all_results.append(res)
        save_result(strategy, urls, all_results)
    finally:
        print('\nDEBUG: Pausa de 60 segundos para inspección visual. Revisa la ventana del navegador...')
        time.sleep(60)
        driver.quit()
        print("Driver de Selenium cerrado.")

    # Guardar todos los resultados al final
    save_result(strategy, urls, all_results)
    print("Scraping finalizado.")

if __name__ == "__main__":
    main()