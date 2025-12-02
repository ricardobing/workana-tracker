/**
 * Módulo de scraping para extraer trabajos de Freelancer.com
 * Utiliza cheerio para parsear HTML y extraer información de proyectos
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

const FREELANCER_URL = 'https://www.freelancer.com.ar/search/projects?types=hourly,fixed&projectLanguages=es&projectSort=latest&projectSkills=2335,1668,1384,55,1658,3,9,13,69,305,335,500,607,669,704,759,1031,2376,2688,2719,2791&projectFixedPriceMin=50&projectHourlyRateMin=10';

/**
 * Normalizar tiempo relativo a timestamp
 * Acepta formatos: "hace 3 horas", "3 hours ago", "hace 30 minutos", etc.
 * @param {string} timeText - Texto de tiempo relativo
 * @returns {number} Timestamp en milisegundos
 */
function normalizePublishedTime(timeText) {
  if (!timeText) {
    return Date.now();
  }

  const now = Date.now();
  const text = timeText.toLowerCase();

  // Buscar números en el texto
  const numberMatch = text.match(/(\d+)/);
  if (!numberMatch) {
    return now;
  }

  const value = parseInt(numberMatch[1]);

  // Detectar unidad de tiempo
  if (text.includes('second') || text.includes('segundo')) {
    return now - (value * 1000);
  } else if (text.includes('minute') || text.includes('minuto')) {
    return now - (value * 60 * 1000);
  } else if (text.includes('hour') || text.includes('hora')) {
    return now - (value * 60 * 60 * 1000);
  } else if (text.includes('day') || text.includes('día') || text.includes('dia')) {
    return now - (value * 24 * 60 * 60 * 1000);
  } else if (text.includes('week') || text.includes('semana')) {
    return now - (value * 7 * 24 * 60 * 60 * 1000);
  } else if (text.includes('month') || text.includes('mes')) {
    return now - (value * 30 * 24 * 60 * 60 * 1000);
  }

  return now;
}

/**
 * Realiza scraping de la página de Freelancer y extrae información de proyectos
 * @returns {Promise<Array>} Array de proyectos con toda su información
 */
export async function scrapeFreelancerJobs() {
  try {
    console.log('[FREELANCER SCRAPER] Iniciando scraping de Freelancer.com...');
    
    // Realizar petición HTTP con headers para simular navegador
    const response = await axios.get(FREELANCER_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://www.freelancer.com.ar/',
      },
      timeout: 15000, // 15 segundos de timeout
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const jobs = [];

    console.log('[FREELANCER SCRAPER] HTML cargado, extrayendo proyectos...');

    // Seleccionar cada card de proyecto
    // Freelancer usa diferentes selectores para sus proyectos
    const projectCards = $('.JobSearchCard-item, .project-item, article.project, [data-role="project-card"]');
    
    console.log(`[FREELANCER SCRAPER] Encontrados ${projectCards.length} elementos de proyecto`);

    projectCards.each((index, element) => {
      try {
        const $project = $(element);
        
        // Extraer título y enlace
        const titleElement = $project.find('.JobSearchCard-primary-heading a, h2 a, h3 a, .project-title a, a[data-title]').first();
        const title = titleElement.text().trim() || titleElement.attr('data-title') || 'Sin título';
        let link = titleElement.attr('href') || '';
        
        // Asegurar que el link sea completo
        if (link && !link.startsWith('http')) {
          link = 'https://www.freelancer.com.ar' + link;
        }

        // Extraer país/ubicación del cliente
        const countryElement = $project.find('.JobSearchCard-primary-heading-location, .location, .country, [class*="location"], [class*="country"]').first();
        const country = countryElement.text().trim() || 'No especificado';

        // Extraer skills/tecnologías
        const skillsElements = $project.find('.JobSearchCard-primary-tags a, .skill, .tag, .badge, [class*="skill"], [class*="tag"]');
        const skills = [];
        skillsElements.each((i, el) => {
          const skill = $(el).text().trim();
          if (skill && skill.length < 50) { // Filtrar textos muy largos
            skills.push(skill);
          }
        });

        // Extraer precio/presupuesto
        const priceElement = $project.find('.JobSearchCard-primary-price, .budget, .price, .amount, [class*="price"], [class*="budget"]').first();
        let price = priceElement.text().trim() || 'No especificado';
        
        // Limpiar el texto del precio
        if (price) {
          price = price.replace(/\s+/g, ' ').trim();
        }

        // Extraer tipo de proyecto (hourly/fixed)
        const typeElement = $project.find('.JobSearchCard-item-type, [class*="type"]');
        let type = 'No especificado';
        const typeText = typeElement.text().toLowerCase();
        if (typeText.includes('hourly') || typeText.includes('hora')) {
          type = 'Por hora';
        } else if (typeText.includes('fixed') || typeText.includes('fijo')) {
          type = 'Precio fijo';
        }

        // Intentar extraer fecha de publicación
        const dateElement = $project.find('.JobSearchCard-primary-heading-days, time, .published, .date, [class*="time"], [class*="date"]').first();
        let publishedText = dateElement.text().trim() || dateElement.attr('datetime') || '';
        
        // Si no hay fecha, usar el índice como indicador de orden
        if (!publishedText) {
          publishedText = `Posición ${index + 1}`;
        }

        // Normalizar timestamp (más reciente = mayor timestamp)
        const timestamp = publishedText.includes('Posición') 
          ? Date.now() - (index * 60000) // Restar 1 minuto por cada posición
          : normalizePublishedTime(publishedText);

        // Extraer descripción (opcional)
        const descElement = $project.find('.JobSearchCard-primary-description, .description, [class*="description"]').first();
        const description = descElement.text().trim().substring(0, 200) || '';

        // Solo agregar proyectos con al menos título y enlace válidos
        if (title !== 'Sin título' && link) {
          jobs.push({
            id: `freelancer-${Date.now()}-${index}`,
            title,
            link,
            country,
            skills: skills.slice(0, 10), // Limitar a 10 skills
            price,
            type,
            publishedDate: publishedText,
            timestamp,
            description,
            source: 'Freelancer',
            scrapedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error(`[FREELANCER SCRAPER] Error procesando proyecto ${index}:`, error.message);
      }
    });

    console.log(`[FREELANCER SCRAPER] Scraping completado: ${jobs.length} proyectos extraídos (antes de filtros)`);

    // FILTROS MANUALES - Freelancer no respeta los parámetros de URL en server-side
    // Skills de programación permitidos (IDs en URL: 2335,1668,1384,55,1658,3,9,13,69,305,335,500,607,669,704,759,1031,2376,2688,2719,2791)
    const allowedSkills = [
      'Python', 'JavaScript', 'PHP', 'HTML', 'CSS', 'React', 'Node', 'Vue', 'Angular',
      'Java', 'C#', 'C++', 'Ruby', 'Go', 'Swift', 'Kotlin', 'TypeScript', 'SQL',
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Azure', 'Docker', 'Kubernetes',
      'API', 'REST', 'GraphQL', 'Git', 'Linux', 'DevOps', 'CI/CD', 'Testing',
      'jQuery', 'Bootstrap', 'Tailwind', 'Next', 'Nuxt', 'Express', 'Django', 'Flask',
      'Laravel', 'Spring', 'Nest', '.NET', 'Android', 'iOS', 'Flutter', 'React Native',
      'WordPress', 'Shopify', 'WooCommerce', 'Magento', 'PrestaShop', 'OpenCart',
      'Web Development', 'Software Development', 'Mobile Development', 'App Development',
      'Backend', 'Frontend', 'Full Stack', 'Database', 'Blockchain', 'Machine Learning',
      'Desarrollo de software', 'Desarrollo web', 'Desarrollo de apps',
      'Diseño web', 'Programador', 'Developer', 'Engineer', 'Ionic', 'Xamarin', 'Unity',
      'Game', 'CRM', 'ERP', 'eCommerce', 'Responsive', 'UI/UX', 'SEO técnico'
    ];

    // Skills que indican NO es trabajo de programación (excluir)
    const excludedKeywords = [
      'Ventas', 'Sales', 'Marketing', 'Redacción', 'Writing', 'Translation',
      'Traducción', 'Data Entry', 'Entrada de datos', 'Virtual Assistant',
      'Asistente virtual', 'Customer Service', 'Atención al cliente', 'Telemarketing',
      'Lead Generation', 'Generación de leads', 'Social Media Marketing',
      'SEO (no técnico)', 'Content Writing', 'Copywriting', 'Diseño de logotipos',
      'Logo Design', 'Illustration', 'Ilustración', 'Video Editing', 'Edición de video',
      'Audio', 'Voice', 'Voz', 'Photography', 'Fotografía'
    ];

    // Filtrar proyectos que tengan al menos un skill de programación
    const filteredJobs = jobs.filter(job => {
      const textToCheck = `${job.title} ${job.description} ${job.skills.join(' ')}`.toLowerCase();

      // PRIMERO: Excluir si contiene keywords de trabajos no técnicos
      const hasExcludedKeyword = excludedKeywords.some(keyword => 
        textToCheck.includes(keyword.toLowerCase())
      );
      if (hasExcludedKeyword) {
        return false; // Excluir trabajos de ventas, marketing, etc.
      }

      // SEGUNDO: Verificar que tenga al menos un skill de programación
      // Si no tiene skills array, verificar en título y descripción
      if (!job.skills || job.skills.length === 0) {
        return allowedSkills.some(skill => textToCheck.includes(skill.toLowerCase()));
      }

      // Si tiene skills, verificar que al menos uno sea de programación
      return job.skills.some(skill => 
        allowedSkills.some(allowed => 
          skill.toLowerCase().includes(allowed.toLowerCase()) ||
          allowed.toLowerCase().includes(skill.toLowerCase())
        )
      );
    });

    // Filtrar por presupuesto mínimo (USD 50+)
    const finalJobs = filteredJobs.filter(job => {
      if (!job.price || job.price === 'No especificado') return true;
      
      // Extraer números del precio
      const priceNumbers = job.price.match(/\d+/g);
      if (!priceNumbers || priceNumbers.length === 0) return true;
      
      // Obtener el primer número (precio mínimo o único)
      const minPrice = parseInt(priceNumbers[0]);
      
      // Filtrar proyectos < $50
      return minPrice >= 50;
    });

    console.log(`[FREELANCER SCRAPER] Después de filtros: ${finalJobs.length} proyectos (${jobs.length - finalJobs.length} filtrados)`);

    // Ordenar por timestamp (más reciente primero)
    finalJobs.sort((a, b) => b.timestamp - a.timestamp);

    return finalJobs;
  } catch (error) {
    console.error('[FREELANCER SCRAPER] Error en scraping:', error.message);
    
    // Si falla el scraping, devolver array vacío con información de error
    return [{
      id: 'error-freelancer-1',
      title: 'Error al obtener proyectos de Freelancer',
      link: FREELANCER_URL,
      country: 'N/A',
      skills: [],
      price: 'N/A',
      type: 'N/A',
      publishedDate: 'Ahora',
      timestamp: Date.now(),
      description: '',
      source: 'Freelancer',
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
