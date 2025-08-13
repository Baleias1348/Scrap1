from .base_strategy import BaseStrategy
from typing import List, Dict
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, parse_qs

class LeychileApiStrategy(BaseStrategy):
    @property
    def name(self) -> str:
        return "LeyChile (API Directa)"

    def _procesar_json(self, datos_json: dict) -> str:
        html_list = None
        if isinstance(datos_json, dict):
            if 'data' in datos_json and isinstance(datos_json['data'], dict):
                html_list = datos_json['data'].get('html', None)
            elif 'html' in datos_json:
                html_list = datos_json.get('html', None)
        if not html_list or not isinstance(html_list, list):
            return "[ERROR] Estructura JSON inesperada: no se encontró 'html'"
        textos = []
        for fragment in html_list:
            html = fragment.get('t', '')
            if html:
                soup = BeautifulSoup(html, 'html.parser')
                textos.append(soup.get_text(separator=' ', strip=True))
        return '\n\n'.join(textos)

    def run(self, driver, normas: List[Dict]) -> List[Dict]:
        resultados = []
        for norma in normas:
            url = norma.get("url_publica")
            url_api = None
            # 1. Si ya es una URL de API
            if url and '/servicios/Navegar/get_norma_json' in url:
                url_api = url
            # 2. Si es una URL pública
            elif url and '/leychile/navegar' in url:
                parsed = urlparse(url)
                params = parse_qs(parsed.query)
                id_norma = params.get('idNorma', [None])[0]
                if id_norma:
                    url_api = f'https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma={id_norma}'
                else:
                    resultado = norma.copy()
                    resultado.update({
                        "status": "error",
                        "texto_limpio": "No se encontró parámetro idNorma en la URL pública.",
                        "url_fuente_datos": None,
                        "json_crudo": None
                    })
                    resultados.append(resultado)
                    continue
            else:
                resultado = norma.copy()
                resultado.update({
                    "status": "error",
                    "texto_limpio": "URL no reconocida como pública ni de API de LeyChile.",
                    "url_fuente_datos": None,
                    "json_crudo": None
                })
                resultados.append(resultado)
                continue

            try:
                resp = requests.get(url_api)
                resp.raise_for_status()
                datos_json = resp.json()
                texto_limpio = self._procesar_json(datos_json)
                resultado = norma.copy()
                resultado.update({
                    "status": "ok",
                    "texto_limpio": texto_limpio,
                    "url_fuente_datos": url_api,
                    "json_crudo": datos_json
                })
                resultados.append(resultado)
            except Exception as e:
                resultado = norma.copy()
                resultado.update({
                    "status": "error",
                    "texto_limpio": f"Error al consultar API: {e}",
                    "url_fuente_datos": url_api,
                    "json_crudo": None
                })
                resultados.append(resultado)
        return resultados
