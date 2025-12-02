/**
 * Módulo de scraping para extraer trabajos de Workana
 * Utiliza cheerio para parsear HTML y extraer información de trabajos
 * Renombrado a workanaScraper para mantener consistencia
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

    // Workana estructura actualizada 2025 - Intentar múltiples selectores
    let jobCards = $('article.project-item, .project-card, [class*="project-item"], div[class*="ProjectCard"]');
    
    // Si no encuentra, intentar con selectores más genéricos
    if (jobCards.length === 0) {
      jobCards = $('article, .card, [data-qa*="project"], [class*="Card"]').filter((i, el) => {
        const text = $(el).text();
        return text.length > 100; // Filtrar solo elementos con contenido significativo
      });
    }
    
    console.log(`[SCRAPER] Encontrados ${jobCards.length} elementos de trabajo`);
    
    // Debug: guardar HTML para análisis si no encuentra trabajos
    if (jobCards.length === 0) {
      console.log('[SCRAPER] ⚠️ No se encontraron trabajos. Analizando estructura HTML...');
      // Buscar todos los enlaces que podrían ser proyectos
      const allLinks = $('a[href*="/project"], a[href*="/job"]');
      console.log(`[SCRAPER] Enlaces de proyectos encontrados: ${allLinks.length}`);
    }

    jobCards.each((index, element) => {
      try {
        const $job = $(element);
        
        // Extraer título y enlace - Selectores actualizados 2025
        const titleElement = $job.find('a[href*="/project"], a[href*="/job"], h2 a, h3 a, h4 a, [class*="title"] a').first();
        let title = titleElement.text().trim();
        let link = titleElement.attr('href') || '';
        
        // Si no encontró título, buscar en cualquier h2, h3, h4
        if (!title) {
          const heading = $job.find('h2, h3, h4').first();
          title = heading.text().trim() || 'Sin título';
          if (!link) {
            link = $job.find('a').first().attr('href') || '';
          }
        }
        
        // Asegurar que el link sea completo
        if (link && !link.startsWith('http')) {
          link = 'https://www.workana.com' + link;
        }

        // Extraer país/cliente - Buscar flags o ubicaciones
        let country = 'No especificado';
        const countryElement = $job.find('[class*="flag"], [class*="country"], [class*="location"], [title], span img').closest('span, div').first();
        if (countryElement.length > 0) {
          country = countryElement.text().trim() || countryElement.attr('title') || 'No especificado';
        }

        // Extraer skills/tecnologías - Buscar badges o tags
        const skillsElements = $job.find('span[class*="badge"], span[class*="tag"], span[class*="skill"], [class*="tag"], [class*="Skill"]');
        const skills = [];
        skillsElements.each((i, el) => {
          const skill = $(el).text().trim();
          if (skill && skill.length > 1 && skill.length < 50 && !skill.includes('$') && !skill.includes('USD')) {
            skills.push(skill);
          }
        });

        // Extraer presupuesto - Buscar cualquier mención de dinero
        let budget = 'No especificado';
        const textContent = $job.text();
        const budgetMatch = textContent.match(/\$[\d,]+\s*-?\s*\$?[\d,]*|USD\s*[\d,]+|Presupuesto[:\s]*\$?[\d,]+/i);
        if (budgetMatch) {
          budget = budgetMatch[0].trim();
        }

        // Extraer información de trabajos pagos del usuario
        const paidJobs = 'No especificado';

        // Intentar extraer fecha de publicación
        const dateElement = $job.find('time, [class*="time"], [class*="date"], [class*="publish"]').first();
        let publishedDate = dateElement.text().trim() || dateElement.attr('datetime') || dateElement.attr('title');
        
        // Si no hay fecha, usar el índice como indicador de orden
        if (!publishedDate) {
          publishedDate = `Hace ${index + 1} minuto${index !== 0 ? 's' : ''}`;
        }

        // Calcular timestamp aproximado (más reciente = mayor timestamp)
        // Los primeros elementos son más recientes
        const timestamp = Date.now() - (index * 60000); // Restar 1 minuto por cada posición

        // Debug logging
        if (index < 3) {
          console.log(`[SCRAPER] Trabajo ${index + 1}:`, {
            title: title.substring(0, 50),
            hasLink: !!link,
            country,
            skills: skills.length,
            budget
          });
        }

        // Solo agregar trabajos con al menos título y enlace válidos
        if (title && title !== 'Sin título' && link && link.includes('workana.com')) {
          jobs.push({
            id: `workana-${Date.now()}-${index}`,
            title,
            link,
            country,
            skills: skills.slice(0, 10), // Limitar a 10 skills
            budget,
            paidJobs,
            publishedDate,
            timestamp,
            source: 'Workana',
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
      id: 'error-workana-1',
      title: 'Error al obtener trabajos',
      link: WORKANA_URL,
      country: 'N/A',
      skills: [],
      budget: 'N/A',
      paidJobs: 'N/A',
      publishedDate: 'Ahora',
      timestamp: Date.now(),
      source: 'Workana',
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
