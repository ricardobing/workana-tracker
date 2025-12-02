/**
 * Página /latest - Trabajos de las últimas 24 horas
 * Muestra todos los trabajos de Workana y Freelancer publicados recientemente
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import JobCard from '@/components/JobCard';
import JobList from '@/components/JobList';
import FilterPanel from '@/components/FilterPanel';

export default function LatestPage() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [theme, setTheme] = useState('light');
  const [breakdown, setBreakdown] = useState({ workana: 0, freelancer: 0 });
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'cards'

  // Estado de filtros
  const [filters, setFilters] = useState({
    title: '',
    country: '',
    skills: '',
  });

  /**
   * Obtener trabajos de las últimas 24 horas
   */
  const fetchLatestJobs = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const url = '/api/all?hours=24';
      const options = forceRefresh 
        ? { method: 'POST' }
        : { method: 'GET' };

      const response = await fetch(url, options);
      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs);
        setLastUpdate(new Date());
        if (data.breakdown) {
          setBreakdown(data.breakdown);
        }
      } else {
        setError(data.error || 'Error al obtener trabajos');
      }
    } catch (err) {
      console.error('Error fetching latest jobs:', err);
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cargar trabajos al montar el componente
   */
  useEffect(() => {
    fetchLatestJobs();

    // Auto-refresh cada 2 minutos
    const interval = setInterval(() => {
      console.log('[AUTO-REFRESH] Actualizando trabajos...');
      fetchLatestJobs();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

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
    fetchLatestJobs(true);
  };

  /**
   * Cambiar tema
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  /**
   * Cargar tema guardado
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="title">
            🔥 Últimas 24 Horas
          </h1>
          <div className="header-actions">
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('list')}
                className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                title="Vista de lista"
              >
                📋
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`view-button ${viewMode === 'cards' ? 'active' : ''}`}
                title="Vista de tarjetas"
              >
                🎴
              </button>
            </div>
            <Link href="/" className="back-button">
              ← Volver
            </Link>
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
          Todos los trabajos publicados en las últimas 24 horas
        </p>
        
        {/* Información de actualización */}
        {lastUpdate && (
          <div className="update-info">
            Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
            <span className="auto-refresh-note">
              • Auto-refresh cada 120 segundos
            </span>
          </div>
        )}

        {/* Desglose por fuente */}
        {(breakdown.workana > 0 || breakdown.freelancer > 0) && (
          <div className="source-breakdown">
            <span className="breakdown-item workana">
              💼 Workana: {breakdown.workana}
            </span>
            <span className="breakdown-item freelancer">
              💻 Freelancer: {breakdown.freelancer}
            </span>
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
        {filteredJobs.length} trabajo{filteredJobs.length !== 1 ? 's' : ''} en las últimas 24 horas
        {filters.title || filters.country || filters.skills ? ` (de ${jobs.length} totales)` : ''}
      </div>

      {/* Estado de carga */}
      {isLoading && jobs.length === 0 && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando trabajos recientes...</p>
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
          No hay trabajos publicados en las últimas 24 horas.
        </div>
      )}

      {/* Vista de lista o tarjetas */}
      {viewMode === 'list' ? (
        <JobList jobs={filteredJobs} />
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>
          Datos obtenidos de{' '}
          <a 
            href="https://www.workana.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Workana
          </a>
          {' '}y{' '}
          <a 
            href="https://www.freelancer.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Freelancer
          </a>
        </p>
        <p className="footer-note">
          🔄 Los datos se actualizan automáticamente cada 120 segundos
        </p>
      </footer>
    </div>
  );
}
