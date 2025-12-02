/**
 * Página Principal - Workana Tracker
 * Muestra trabajos de Workana con filtros y auto-refresh
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import JobCard from '@/components/JobCard';
import FilterPanel from '@/components/FilterPanel';

// Intervalo de auto-refresh (2 minutos = 120 segundos)
const REFRESH_INTERVAL = parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL || '120') * 1000;

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [newJobsCount, setNewJobsCount] = useState(0);
  const [theme, setTheme] = useState('light');
  
  // Estado de filtros
  const [filters, setFilters] = useState({
    title: '',
    country: '',
    skills: '',
  });

  /**
   * Obtener trabajos de la API
   */
  const fetchJobs = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const url = '/api/jobs';
      const options = forceRefresh 
        ? { method: 'POST' }
        : { method: 'GET' };

      const response = await fetch(url, options);
      const data = await response.json();

      if (data.success) {
        // Detectar nuevos trabajos
        if (jobs.length > 0 && data.jobs.length > jobs.length) {
          const newCount = data.jobs.length - jobs.length;
          setNewJobsCount(newCount);
          
          // Limpiar contador después de 5 segundos
          setTimeout(() => setNewJobsCount(0), 5000);
        }

        setJobs(data.jobs);
        setLastUpdate(new Date());
      } else {
        setError(data.error || 'Error al obtener trabajos');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [jobs.length]);

  /**
   * Cargar trabajos al montar el componente
   */
  useEffect(() => {
    fetchJobs();
  }, []);

  /**
   * Auto-refresh cada 2 minutos
   */
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[AUTO-REFRESH] Actualizando trabajos...');
      fetchJobs();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchJobs]);

  /**
   * Aplicar filtros cuando cambian los trabajos o filtros
   */
  useEffect(() => {
    let filtered = [...jobs];

    // Filtrar por título
    if (filters.title) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }

    // Filtrar por país
    if (filters.country) {
      filtered = filtered.filter(job =>
        job.country.toLowerCase().includes(filters.country.toLowerCase())
      );
    }

    // Filtrar por skills
    if (filters.skills) {
      filtered = filtered.filter(job =>
        job.skills.some(skill =>
          skill.toLowerCase().includes(filters.skills.toLowerCase())
        )
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, filters]);

  /**
   * Manejar cambio de filtros
   */
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  /**
   * Manejar refresh manual
   */
  const handleRefresh = () => {
    fetchJobs(true);
  };

  /**
   * Cambiar tema
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  /**
   * Cargar tema guardado
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  /**
   * Guardar tema
   */
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="title">
            📊 Workana Tracker
          </h1>
          <div className="header-actions">
            <button 
              onClick={toggleTheme} 
              className="theme-toggle"
              aria-label="Cambiar tema"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
        <p className="subtitle">
          Trabajos de programación ordenados por fecha de publicación
        </p>
        
        {/* Información de actualización */}
        {lastUpdate && (
          <div className="update-info">
            Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
            <span className="auto-refresh-note">
              • Auto-refresh cada {REFRESH_INTERVAL / 1000} segundos
            </span>
          </div>
        )}

        {/* Contador de nuevos trabajos */}
        {newJobsCount > 0 && (
          <div className="new-jobs-alert">
            🎉 ¡{newJobsCount} nuevo{newJobsCount > 1 ? 's' : ''} trabajo{newJobsCount > 1 ? 's' : ''} disponible{newJobsCount > 1 ? 's' : ''}!
          </div>
        )}
      </header>

      {/* Panel de filtros */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Contador de resultados */}
      <div className="results-count">
        {filteredJobs.length} trabajo{filteredJobs.length !== 1 ? 's' : ''} encontrado{filteredJobs.length !== 1 ? 's' : ''}
        {filters.title || filters.country || filters.skills ? ` (de ${jobs.length} totales)` : ''}
      </div>

      {/* Estado de carga */}
      {isLoading && jobs.length === 0 && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando trabajos de Workana...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Lista de trabajos */}
      {!isLoading && filteredJobs.length === 0 && jobs.length > 0 && (
        <div className="no-results">
          No se encontraron trabajos con los filtros aplicados.
        </div>
      )}

      {!isLoading && jobs.length === 0 && !error && (
        <div className="no-results">
          No hay trabajos disponibles en este momento.
        </div>
      )}

      <div className="jobs-grid">
        {filteredJobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>
          Datos obtenidos de{' '}
          <a 
            href="https://www.workana.com/jobs?category=it-programming&language=es&publication=1d"
            target="_blank"
            rel="noopener noreferrer"
          >
            Workana
          </a>
        </p>
        <p className="footer-note">
          🔄 Los datos se actualizan automáticamente cada {REFRESH_INTERVAL / 1000} segundos
        </p>
      </footer>
    </div>
  );
}
