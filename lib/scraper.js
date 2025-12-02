/**
 * Módulo de scraping para extraer trabajos de Workana
 * Utiliza cheerio para parsear HTML y extraer información de trabajos
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

const WORKANA_URL = 'https://www.workana.com/jobs?category=it-programming&language=es&publication=1d';

/**
 * Realiza scraping de la página de Workana y extrae información de trabajos
 * @returns {Promise<Array>} Array de trabajos con toda su información
 */
export async function scrapeWorkanaJobs() {
  try {
    console.log('[SCRAPER] Iniciando scraping de Workana...');
    
    // Realizar petición HTTP con headers para simular navegador
    const response = await axios.get(WORKANA_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
      timeout: 15000, // 15 segundos de timeout
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const jobs = [];

    console.log('[SCRAPER] HTML cargado, extrayendo trabajos...');

    // Seleccionar cada card de trabajo
    // Workana usa diferentes selectores, probamos varios
    const jobCards = $('.project-item, .card-project, article[data-project-id], .list-group-item.project');
    
    console.log(`[SCRAPER] Encontrados ${jobCards.length} elementos de trabajo`);

    jobCards.each((index, element) => {
      try {
        const $job = $(element);
        
        // Extraer título y enlace
        const titleElement = $job.find('h2 a, h3 a, .project-title a, a.project-link').first();
        const title = titleElement.text().trim() || 'Sin título';
        let link = titleElement.attr('href') || '';
        
        // Asegurar que el link sea completo
        if (link && !link.startsWith('http')) {
          link = 'https://www.workana.com' + link;
        }

        // Extraer país/cliente
        const countryElement = $job.find('.country, .location, .flag-name, [class*="country"], [class*="location"]').first();
        const country = countryElement.text().trim() || 'No especificado';

        // Extraer skills/tecnologías
        const skillsElements = $job.find('.skills span, .skill, .badge, .tag, [class*="skill"]');
        const skills = [];
        skillsElements.each((i, el) => {
          const skill = $(el).text().trim();
          if (skill && skill.length < 50) { // Filtrar textos muy largos
            skills.push(skill);
          }
        });

        // Extraer presupuesto
        const budgetElement = $job.find('.budget, .amount, .price, [class*="budget"], [class*="amount"]').first();
        let budget = budgetElement.text().trim() || 'No especificado';
        
        // Limpiar el texto del presupuesto
        if (budget) {
          budget = budget.replace(/\s+/g, ' ').trim();
        }

        // Extraer información de trabajos pagos del usuario
        const verifiedElement = $job.find('.verified, .payment-verified, [class*="verified"]');
        const paidJobsText = verifiedElement.text().trim();
        const paidJobs = paidJobsText || 'No especificado';

        // Intentar extraer fecha de publicación
        const dateElement = $job.find('.time, .date, .published, time, [class*="time"], [class*="date"]').first();
        let publishedDate = dateElement.text().trim();
        
        // Si no hay fecha, usar el índice como indicador de orden
        if (!publishedDate) {
          publishedDate = `Posición ${index + 1}`;
        }

        // Calcular timestamp aproximado (más reciente = mayor timestamp)
        // Los primeros elementos son más recientes
        const timestamp = Date.now() - (index * 60000); // Restar 1 minuto por cada posición

        // Solo agregar trabajos con al menos título y enlace válidos
        if (title !== 'Sin título' && link) {
          jobs.push({
            id: `job-${Date.now()}-${index}`,
            title,
            link,
            country,
            skills: skills.slice(0, 10), // Limitar a 10 skills
            budget,
            paidJobs,
            publishedDate,
            timestamp,
            scrapedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error(`[SCRAPER] Error procesando trabajo ${index}:`, error.message);
      }
    });

    console.log(`[SCRAPER] Scraping completado: ${jobs.length} trabajos extraídos`);

    // Ordenar por timestamp (más reciente primero)
    jobs.sort((a, b) => b.timestamp - a.timestamp);

    return jobs;
  } catch (error) {
    console.error('[SCRAPER] Error en scraping:', error.message);
    
    // Si falla el scraping, devolver array vacío con información de error
    return [{
      id: 'error-1',
      title: 'Error al obtener trabajos',
      link: WORKANA_URL,
      country: 'N/A',
      skills: [],
      budget: 'N/A',
      paidJobs: 'N/A',
      publishedDate: 'Ahora',
      timestamp: Date.now(),
      error: error.message,
      scrapedAt: new Date().toISOString(),
    }];
  }
}

/**
 * Calcular tiempo transcurrido desde una fecha
 * @param {number} timestamp - Timestamp en milisegundos
 * @returns {string} Texto formateado "hace X minutos/horas"
 */
export function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) {
    return `hace ${days} día${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  } else {
    return 'hace un momento';
  }
}
