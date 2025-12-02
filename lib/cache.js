/**
 * Sistema de caché en memoria para almacenar resultados de scraping
 * Evita hacer scraping repetido dentro del intervalo de tiempo configurado
 */

class Cache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Obtener un valor del caché
   * @param {string} key - La clave del caché
   * @returns {any|null} El valor almacenado o null si expiró/no existe
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Verificar si el caché expiró
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Guardar un valor en el caché
   * @param {string} key - La clave del caché
   * @param {any} value - El valor a almacenar
   * @param {number} ttl - Tiempo de vida en milisegundos (default: 60000ms = 60s)
   */
  set(key, value, ttl = 60000) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Limpiar un elemento específico del caché
   * @param {string} key - La clave a eliminar
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Limpiar todo el caché
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Obtener el tamaño actual del caché
   * @returns {number} Cantidad de elementos en caché
   */
  size() {
    return this.cache.size;
  }
}

// Exportar una instancia singleton del caché
const cacheInstance = new Cache();

export default cacheInstance;
