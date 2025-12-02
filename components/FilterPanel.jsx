/**
 * Componente FilterPanel
 * Panel de filtros para buscar trabajos por título, país y skills
 */

'use client';

export default function FilterPanel({ filters, onFilterChange, onRefresh, isLoading }) {
  return (
    <div className="filter-panel">
      <div className="filters-row">
        {/* Filtro por título */}
        <div className="filter-group">
          <label htmlFor="title-filter">🔍 Título</label>
          <input
            id="title-filter"
            type="text"
            placeholder="Buscar por título..."
            value={filters.title}
            onChange={(e) => onFilterChange('title', e.target.value)}
            className="filter-input"
          />
        </div>

        {/* Filtro por país */}
        <div className="filter-group">
          <label htmlFor="country-filter">📍 País</label>
          <input
            id="country-filter"
            type="text"
            placeholder="Buscar por país..."
            value={filters.country}
            onChange={(e) => onFilterChange('country', e.target.value)}
            className="filter-input"
          />
        </div>

        {/* Filtro por skills */}
        <div className="filter-group">
          <label htmlFor="skills-filter">💻 Skills</label>
          <input
            id="skills-filter"
            type="text"
            placeholder="Buscar por skills..."
            value={filters.skills}
            onChange={(e) => onFilterChange('skills', e.target.value)}
            className="filter-input"
          />
        </div>

        {/* Botón refrescar */}
        <div className="filter-group">
          <label>&nbsp;</label>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="refresh-button"
          >
            {isLoading ? '⏳ Cargando...' : '🔄 Refrescar'}
          </button>
        </div>
      </div>
    </div>
  );
}
