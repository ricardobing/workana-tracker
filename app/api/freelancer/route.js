/**
 * API Route: /api/freelancer
 * Endpoint para obtener proyectos de Freelancer.com con scraping y caché
 */

import { NextResponse } from 'next/server';
import { scrapeFreelancerJobs } from '@/lib/freelancerScraper';
import cache from '@/lib/cache';

// Configuración del cache (60 segundos por defecto)
const CACHE_DURATION = parseInt(process.env.CACHE_DURATION || '60') * 1000;
const CACHE_KEY = 'freelancer-jobs';

/**
 * GET /api/freelancer
 * Obtiene los proyectos de Freelancer, usando caché si está disponible
 */
export async function GET(request) {
  try {
    console.log('[API] Petición recibida en /api/freelancer');

    // Intentar obtener del caché primero
    const cachedJobs = cache.get(CACHE_KEY);
    
    if (cachedJobs) {
      console.log('[API] Devolviendo resultados desde caché');
      return NextResponse.json({
        success: true,
        jobs: cachedJobs,
        cached: true,
        count: cachedJobs.length,
        source: 'Freelancer',
        timestamp: new Date().toISOString(),
      });
    }

    // Si no hay caché, hacer scraping
    console.log('[API] Caché expirado/vacío, realizando scraping...');
    const jobs = await scrapeFreelancerJobs();

    // Guardar en caché
    cache.set(CACHE_KEY, jobs, CACHE_DURATION);
    console.log(`[API] Resultados guardados en caché por ${CACHE_DURATION / 1000} segundos`);

    return NextResponse.json({
      success: true,
      jobs,
      cached: false,
      count: jobs.length,
      source: 'Freelancer',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error en endpoint /api/freelancer:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      jobs: [],
      count: 0,
      source: 'Freelancer',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * POST /api/freelancer
 * Forzar actualización del caché (limpiar caché y hacer nuevo scraping)
 */
export async function POST(request) {
  try {
    console.log('[API] Petición POST recibida - forzando actualización');

    // Limpiar caché
    cache.delete(CACHE_KEY);
    console.log('[API] Caché limpiado');

    // Hacer nuevo scraping
    const jobs = await scrapeFreelancerJobs();

    // Guardar en caché
    cache.set(CACHE_KEY, jobs, CACHE_DURATION);
    console.log('[API] Nuevos resultados guardados en caché');

    return NextResponse.json({
      success: true,
      jobs,
      cached: false,
      forced: true,
      count: jobs.length,
      source: 'Freelancer',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error en POST /api/freelancer:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      jobs: [],
      count: 0,
      source: 'Freelancer',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Configuración de runtime para Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
