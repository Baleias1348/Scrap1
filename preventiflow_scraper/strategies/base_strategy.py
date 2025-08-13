from abc import ABC, abstractmethod
from typing import List, Dict

class BaseStrategy(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """Nombre descriptivo de la estrategia."""
        pass

    @abstractmethod
    def run(self, normas: List[Dict]) -> List[Dict]:
        """
        Ejecuta la estrategia sobre una lista de objetos de norma enriquecidos.
        Cada objeto debe ser un diccionario con al menos las siguientes claves:
            - fuente
            - nombre_norma
            - jerarquia
            - descripcion
            - palabras_clave
            - url_publica
            - url_fuente_datos (opcional)
            - comentarios_experto (opcional)
        Retorna una lista de diccionarios con todos los metadatos originales y los resultados del scraping.
        """
        pass
