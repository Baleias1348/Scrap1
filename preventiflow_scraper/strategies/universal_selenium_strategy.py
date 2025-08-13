from .base_strategy import BaseStrategy
from typing import List, Dict, Optional
from selenium import webdriver
from bs4 import BeautifulSoup
import time

def limpiar_texto_universal(texto: str) -> str:
    lineas = (line.strip() for line in texto.splitlines())
    return '\n'.join(line for line in lineas if line)

class UniversalSeleniumStrategy(BaseStrategy):
    """
    Estrategia todoterreno: usa Selenium para obtener el HTML renderizado
    y BeautifulSoup para una limpieza básica del contenido.
    """
    @property
    def name(self) -> str:
        return "Universal (Selenium Básico)"

    def run(self, driver: webdriver.Chrome, normas: List[Dict]) -> List[Dict]:
        resultados = []
        for norma in normas:
            url = norma.get("url_publica")
            if not url:
                continue

            print(f"--- Usando estrategia '{self.name}' para: {url} ---")
            resultado_actual = norma.copy() # Copiamos los metadatos de entrada

            try:
                driver.get(url)
                # Damos un par de segundos para que el JavaScript inicial cargue
                time.sleep(3)
                
                sopa = BeautifulSoup(driver.page_source, 'html.parser')
                
                # Elimina etiquetas de script, estilo, nav, header y footer
                elementos_a_eliminar = sopa.select('script, style, nav, header, footer, aside, .menu, .sidebar, .footer')
                for elemento in elementos_a_eliminar:
                    elemento.decompose()

                texto_extraido = limpiar_texto_universal(sopa.body.get_text() if sopa.body else "")
                
                if texto_extraido:
                    print(f"INFO: Texto extraído exitosamente de {url}.")
                    resultado_actual['texto_limpio'] = texto_extraido
                    resultado_actual['json_crudo'] = {'info': 'Extracción universal, no hay JSON crudo.'}
                else:
                    print(f"ADVERTENCIA: No se encontró contenido textual en {url}.")
                    resultado_actual['texto_limpio'] = ""
                
                resultados.append(resultado_actual)

            except Exception as e:
                print(f"ERROR: Ocurrió un error inesperado con {url}: {e}")
                resultado_actual['texto_limpio'] = f"Error al procesar: {e}"
                resultados.append(resultado_actual)
        
        return resultados
