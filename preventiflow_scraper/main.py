import pandas as pd
import sys
import traceback
from strategies.leychile_api_strategy import LeychileApiStrategy
from strategies.universal_selenium_strategy import UniversalSeleniumStrategy
from database_manager import save_result
import undetected_chromedriver as uc

CSV_INPUT = "input_normas.csv"


def leer_normas_csv(path_csv):
    df = pd.read_csv(path_csv)
    # Normaliza claves a minúsculas y quita espacios
    df.columns = [c.strip().lower() for c in df.columns]
    normas = df.to_dict(orient='records')
    return normas


def main():
    normas = leer_normas_csv(CSV_INPUT)
    estrategia_leychile = LeychileApiStrategy()
    estrategia_universal = UniversalSeleniumStrategy()
    driver = None
    try:
        driver = uc.Chrome()
        for idx, norma in enumerate(normas):
            try:
                url = norma.get('url_publica', '')
                if 'bcn.cl/leychile' in url:
                    resultado = estrategia_leychile.run(driver, [norma])
                # Aquí puedes añadir más estrategias específicas (ej: elif 'minsal.cl' in url: ...)
                else:
                    resultado = estrategia_universal.run(driver, [norma])
                if resultado and isinstance(resultado, list):
                    for res in resultado:
                        save_result([res], 'scraper_modular')
                else:
                    print(f"[WARN] Estrategia no devolvió resultado válido para fila {idx+1}")
            except Exception as e:
                print(f"[ERROR] Fallo procesando norma en fila {idx+1}: {e}")
                traceback.print_exc()
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    main()
