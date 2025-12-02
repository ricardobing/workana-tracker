/**
 * API Route: /api/all
 * Endpoint unificado que combina trabajos de Workana y Freelancer
 * Filtra por últimas 24 horas y normaliza campos
 */

import { NextResponse } from 'next/server';
import { scrapeWorkanaJobs } from '@/lib/scraper';
import { scrapeFreelancerJobs } from '@/lib/freelancerScraper';
import cache from '@/lib/cache';

// Configuración del cache (60 segundos por defecto)
const CACHE_DURATION = parseInt(process.env.CACHE_DURATION || '60') * 1000;
const CACHE_KEY = 'all-jobs';

// 24 horas en milisegundos
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

/**
 * Normaliza un trabajo de cualquier fuente a un formato común
 * @param {Object} job - Trabajo a normalizar
 * @returns {Object} Trabajo normalizado
 */
function normalizeJob(job) {
  return {
    id: job.id,
    title: job.title,
    link: job.link,
    client: job.country, // Normalizar "country" a "client"
    country: job.country,
    skills: job.skills || [],
    price: job.price || job.budget || 'No especificado',
    budget: job.budget || job.price || 'No especificado',
    type: job.type || 'No especificado',
    source: job.source,
    timestamp: job.timestamp,
    publishedDate: job.publishedDate,
    description: job.description || '',
    paidJobs: job.paidJobs || null,
    scrapedAt: job.scrapedAt,
  };
}

/**
 * GET /api/all
 * Obtiene trabajos combinados de todas las fuentes
 * @param {Request} request - Puede incluir query param ?hours=24 para filtrar
 */
export async function GET(request) {
  try {
    console.log('[API ALL] Petición recibida en /api/all');

    // Obtener parámetro de horas (por defecto 24)
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');
    const timeLimit = Date.now() - (hours * 60 * 60 * 1000);

    // Intentar obtener del caché primero
    const cachedJobs = cache.get(CACHE_KEY);
    
    if (cachedJobs) {
      console.log('[API ALL] Devolviendo resultados desde caché');
      
      // Filtrar por tiempo si se especifica
      const filteredJobs = cachedJobs.filter(job => job.timestamp >= timeLimit);
      
      return NextResponse.json({
        success: true,
        jobs: filteredJobs,
        cached: true,
        count: filteredJobs.length,
        totalCount: cachedJobs.length,
        hours,
        sources: ['Workana', 'Freelancer'],
        timestamp: new Date().toISOString(),
      });
    }

    // Si no hay caché, obtener de ambas fuentes
    console.log('[API ALL] Caché expirado/vacío, obteniendo de todas las fuentes...');

    // Obtener trabajos de ambas fuentes en paralelo
    const [workanaJobs, freelancerJobs] = await Promise.all([
      scrapeWorkanaJobs().catch(err => {
        console.error('[API ALL] Error obteniendo Workana:', err);
        return [];
      }),
      scrapeFreelancerJobs().catch(err => {
        console.error('[API ALL] Error obteniendo Freelancer:', err);
        return [];
      }),
    ]);

    console.log(`[API ALL] Obtenidos ${workanaJobs.length} trabajos de Workana`);
    console.log(`[API ALL] Obtenidos ${freelancerJobs.length} trabajos de Freelancer`);

    // Normalizar todos los trabajos
    const normalizedWorkana = workanaJobs.map(normalizeJob);
    const normalizedFreelancer = freelancerJobs.map(normalizeJob);

    // Combinar ambos arrays
    const allJobs = [...normalizedWorkana, ...normalizedFreelancer];

    // Ordenar por timestamp descendente (más reciente primero)
    allJobs.sort((a, b) => b.timestamp - a.timestamp);

    // Guardar en caché (sin filtrar)
    cache.set(CACHE_KEY, allJobs, CACHE_DURATION);
    console.log(`[API ALL] ${allJobs.length} trabajos guardados en caché`);

    // Filtrar por tiempo límite
    const filteredJobs = allJobs.filter(job => job.timestamp >= timeLimit);

    console.log(`[API ALL] ${filteredJobs.length} trabajos dentro de las últimas ${hours} horas`);

    return NextResponse.json({
      success: true,
      jobs: filteredJobs,
      cached: false,
      count: filteredJobs.length,
      totalCount: allJobs.length,
      hours,
      sources: ['Workana', 'Freelancer'],
      breakdown: {
        workana: normalizedWorkana.length,
        freelancer: normalizedFreelancer.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API ALL] Error en endpoint /api/all:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      jobs: [],
      count: 0,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * POST /api/all
 * Forzar actualización del caché (limpiar y hacer nuevo scraping)
 */
export async function POST(request) {
  try {
    console.log('[API ALL] Petición POST recibida - forzando actualización');

    // Limpiar caché
    cache.delete(CACHE_KEY);
    cache.delete('workana-jobs');
    cache.delete('freelancer-jobs');
    console.log('[API ALL] Caché limpiado');

    // Obtener trabajos de ambas fuentes
    const [workanaJobs, freelancerJobs] = await Promise.all([
      scrapeWorkanaJobs().catch(err => {
        console.error('[API ALL] Error obteniendo Workana:', err);
        return [];
      }),
      scrapeFreelancerJobs().catch(err => {
        console.error('[API ALL] Error obteniendo Freelancer:', err);
        return [];
      }),
    ]);

    // Normalizar y combinar
    const normalizedWorkana = workanaJobs.map(normalizeJob);
    const normalizedFreelancer = freelancerJobs.map(normalizeJob);
    const allJobs = [...normalizedWorkana, ...normalizedFreelancer];

    // Ordenar por timestamp
    allJobs.sort((a, b) => b.timestamp - a.timestamp);

    // Guardar en caché
    cache.set(CACHE_KEY, allJobs, CACHE_DURATION);
    console.log('[API ALL] Nuevos resultados guardados en caché');

    return NextResponse.json({
      success: true,
      jobs: allJobs,
      cached: false,
      forced: true,
      count: allJobs.length,
      sources: ['Workana', 'Freelancer'],
      breakdown: {
        workana: normalizedWorkana.length,
        freelancer: normalizedFreelancer.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API ALL] Error en POST /api/all:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      jobs: [],
      count: 0,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Configuración de runtime para Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
