/**
 * Módulo de scraping para extraer trabajos de Workana
 * Workana usa Vue.js - los datos están en atributos data-* como JSON
 * Actualizado 2025: Extrae JSON embebido en lugar de parsear DOM
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

const WORKANA_URL = 'https://www.workana.com/jobs?category=it-programming&language=es&publication=1d';

/**
 * Decodifica entidades HTML
 */
function decodeHtmlEntities(text) {
  const entities = {
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&#39;': "'",
    '&apos;': "'"
  };
  return text.replace(/&quot;|&amp;|&lt;|&gt;|&#39;|&apos;/g, match => entities[match] || match);
}

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
    const jobs = [];

    console.log('[SCRAPER] HTML cargado, buscando datos JSON embebidos...');

    // Workana 2025: Los datos están en el atributo :results-initials como JSON
    const resultsMatch = html.match(/:results-initials='([^']+)'/);
    
    if (!resultsMatch) {
      console.log('[SCRAPER] ⚠️ No se encontró el atributo :results-initials');
      
      // Intentar buscar con comillas dobles como backup
      const altMatch = html.match(/:results-initials="([^"]+)"/);
      if (!altMatch) {
        console.log('[SCRAPER] ❌ Tampoco se encontró con comillas dobles');
        return [];
      }
      console.log('[SCRAPER] ✅ Encontrado con comillas dobles');
    }

    // Decodificar HTML entities
    const encodedJson = resultsMatch ? resultsMatch[1] : '';
    if (!encodedJson) {
      console.log('[SCRAPER] ❌ JSON vacío');
      return [];
    }

    const decodedJson = decodeHtmlEntities(encodedJson);
    
    let projectsData;
    try {
      projectsData = JSON.parse(decodedJson);
    } catch (e) {
      console.log('[SCRAPER] ❌ Error parseando JSON:', e.message);
      console.log('[SCRAPER] Primeros 200 caracteres del JSON:', decodedJson.substring(0, 200));
      return [];
    }

    const resultCount = projectsData.results?.length || 0;
    console.log(`[SCRAPER] ✅ Datos JSON parseados: ${resultCount} proyectos encontrados`);

    // Procesar cada proyecto del JSON
    if (!projectsData.results || projectsData.results.length === 0) {
      console.log('[SCRAPER] No hay proyectos en los resultados');
      return [];
    }

    // Procesar cada proyecto
    projectsData.results.forEach((project, index) => {
      try {
        // Extraer el título limpio (sin HTML)
        let title = 'Sin título';
        if (project.title) {
          // El título viene con HTML tags, extraerlo con cheerio
          const $title = cheerio.load(project.title);
          title = $title.text().trim();
          
          // Si todavía tiene el atributo title, usarlo
          const titleAttr = $title('span').attr('title');
          if (titleAttr && titleAttr.length > title.length) {
            title = titleAttr;
          }
        }

        // Extraer el link del proyecto
        let link = '';
        if (project.slug) {
          link = `https://www.workana.com/job/${project.slug}?ref=projects_${index + 1}`;
        }
        
        // Extraer URL alternativa si existe en el HTML del título
        if (!link && project.title) {
          const linkMatch = project.title.match(/href=["']([^"']+)["']/);
          if (linkMatch) {
            const href = linkMatch[1];
            link = href.startsWith('http') ? href : `https://www.workana.com${href}`;
          }
        }

        // País/ubicación del cliente
        let country = 'No especificado';
        if (project.authorCountry) {
          // Si tiene HTML, extraerlo
          const $country = cheerio.load(project.authorCountry);
          const title = $country('img').attr('title');
          const text = $country.text().trim();
          country = title || text || project.authorCountry;
        } else if (project.country) {
          const $country = cheerio.load(project.country);
          country = $country.text().trim() || project.country;
        } else if (project.authorName) {
          country = project.authorName;
        }

        // Skills/tecnologías - son objetos con propiedades anchorText, name, slug, etc.
        let skills = [];
        if (Array.isArray(project.skills)) {
          skills = project.skills.map(skill => {
            if (typeof skill === 'string') return skill;
            if (skill && skill.anchorText) return skill.anchorText; // Workana 2025 usa anchorText
            if (skill && skill.name) return skill.name;
            if (skill && skill.label) return skill.label;
            if (skill && skill.title) return skill.title;
            return null;
          }).filter(s => s !== null);
        } else if (Array.isArray(project.categories)) {
          skills = project.categories.map(cat => typeof cat === 'string' ? cat : cat.anchorText || cat.name || cat.label).filter(Boolean);
        } else if (Array.isArray(project.tags)) {
          skills = project.tags.map(tag => typeof tag === 'string' ? tag : tag.anchorText || tag.name || tag.label).filter(Boolean);
        }

        // Presupuesto
        let budget = 'No especificado';
        if (project.budget) {
          budget = project.budget;
        } else if (project.projectType && project.projectAmount) {
          budget = `${project.projectType}: ${project.projectAmount}`;
        } else if (project.amount) {
          budget = project.amount;
        } else if (project.price) {
          budget = project.price;
        }

        // Fecha de publicación
        let publishedDate = 'Recientemente';
        if (project.publishedDate) {
          publishedDate = project.publishedDate;
        } else if (project.timeElapsed) {
          publishedDate = project.timeElapsed;
        } else if (project.created) {
          publishedDate = project.created;
        }

        // Descripción
        let description = '';
        if (project.description) {
          const $desc = cheerio.load(project.description);
          description = $desc.text().trim().substring(0, 300);
        }

        // Debug: mostrar primeros 3 proyectos
        if (index < 3) {
          console.log(`[SCRAPER DEBUG] Proyecto ${index + 1}:`);
          console.log(`  Título: ${title.substring(0, 60)}...`);
          console.log(`  Link: ${link}`);
          console.log(`  País: ${country}`);
          console.log(`  Skills: ${skills.length > 0 ? skills.slice(0, 3).join(', ') : 'ninguno'}`);
          console.log(`  Presupuesto: ${budget}`);
          console.log(`  Publicado: ${publishedDate}`);
        }

        // Agregar trabajo solo si tiene datos válidos
        if (title !== 'Sin título' && link) {
          jobs.push({
            id: `workana-${Date.now()}-${index}`,
            title,
            link,
            country,
            skills: Array.isArray(skills) ? skills.slice(0, 10) : [],
            budget,
            publishedDate,
            timestamp: Date.now() - (index * 60000), // Timestamps descendentes
            description,
            source: 'Workana',
            scrapedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error(`[SCRAPER] Error procesando proyecto ${index}:`, error.message);
      }
    });

    console.log(`[SCRAPER] ✅ Scraping completado: ${jobs.length} trabajos extraídos`);

    return jobs;
  } catch (error) {
    console.error('[SCRAPER] Error en scraping:', error.message);
    return [];
  }
}

/**
 * Exportar función con nombre alternativo para compatibilidad
 */
export const scrapeJobs = scrapeWorkanaJobs;
export default scrapeWorkanaJobs;
