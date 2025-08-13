import requests
import json
import sys
import os
import uuid
from datetime import datetime
from urllib.parse import urlparse, parse_qs
from bs4 import BeautifulSoup
from typing import List, Dict

# --- Procesamiento del JSON de la API ---
def _procesar_json(data: dict) -> str:
    """Extrae y concatena texto limpio de la clave ['data']['html'] usando BeautifulSoup."""
    texto = []
    try:
        html_list = data.get('data', {}).get('html', [])
        for bloque in html_list:
            if isinstance(bloque, dict) and 't' in bloque:
                soup = BeautifulSoup(bloque['t'], 'html.parser')
                texto.append(soup.get_text(separator=' ', strip=True))
    except Exception as e:
        texto.append(f"[ERROR al procesar JSON]: {e}")
    return '\n'.join(texto)

# --- Guardar resultados ---
def save_result(resultados: List[Dict], carpeta: str = "results"):
    os.makedirs(carpeta, exist_ok=True)
    nombre = f"leychile_lazaro_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}.json"
    ruta = os.path.join(carpeta, nombre)
    with open(ruta, 'w', encoding='utf-8') as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)
    print(f"[INFO] Resultado exportado local: {ruta}")

# --- Función principal ---
def ejecutar_scrapeo_leychile_api(urls: List[str]) -> List[Dict]:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9',
        'Referer': 'https://www.bcn.cl/',
        'Connection': 'keep-alive',
    }
    resultados = []
    for url in urls:
        url_api = None
        # Traducción de URL pública a API
        if '/servicios/Navegar/get_norma_json' in url:
            url_api = url
        elif '/leychile/navegar' in url:
            parsed = urlparse(url)
            params = parse_qs(parsed.query)
            id_norma = params.get('idNorma', [None])[0]
            if id_norma:
                url_api = f'https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma={id_norma}'
            else:
                resultados.append({
                    "url": url,
                    "status": "error",
                    "content": "No se encontró parámetro idNorma en la URL pública."
                })
                continue
        else:
            resultados.append({
                "url": url,
                "status": "error",
                "content": "URL no reconocida como pública ni de API de LeyChile."
            })
            continue
        print(f"[INFO] Consultando URL API traducida: {url_api}")
        try:
            resp = requests.get(url_api, headers=headers, timeout=30)
            if resp.status_code != 200:
                resultados.append({
                    "url": url,
                    "status": "error",
                    "content": f"HTTP {resp.status_code}",
                    "raw_text": resp.text
                })
                continue
            try:
                data = resp.json()
                texto = _procesar_json(data)
                resultados.append({
                    "url": url,
                    "status": "ok",
                    "content": texto,
                    "raw_json": data
                })
            except json.JSONDecodeError:
                resultados.append({
                    "url": url,
                    "status": "error",
                    "content": "La API no devolvió un JSON válido. Posible bloqueo o página de error.",
                    "raw_text": resp.text
                })
        except Exception as e:
            resultados.append({
                "url": url,
                "status": "error",
                "content": str(e)
            })
    return resultados

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python Lazaro_Scrap.py <url1> [<url2> ...]")
        sys.exit(1)
    urls = sys.argv[1:]
    resultados = ejecutar_scrapeo_leychile_api(urls)
    save_result(resultados)
