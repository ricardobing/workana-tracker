/**
 * Componente JobCard
 * Muestra la información de un trabajo individual de cualquier fuente
 */

'use client';

export default function JobCard({ job }) {
  // Colores por fuente
  const sourceColors = {
    'Workana': '#8B5CF6',
    'Freelancer': '#3B82F6',
  };
  /**
   * Calcula el tiempo transcurrido desde la publicación
   */
  const getTimeAgo = (timestamp) => {
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
  };

  return (
    <div className="job-card">
      {/* Badge de fuente */}
      {job.source && (
        <div className="job-source-badge" style={{ backgroundColor: sourceColors[job.source] || '#6B7280' }}>
          {job.source}
        </div>
      )}

      {/* Título con enlace */}
      <div className="job-header">
        <h3 className="job-title">
          <a 
            href={job.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="job-link"
          >
            {job.title}
          </a>
        </h3>
        <span className="job-time">{getTimeAgo(job.timestamp)}</span>
      </div>

      {/* País y cliente */}
      <div className="job-meta">
        <span className="job-country">
          📍 {job.country}
        </span>
        {job.paidJobs && job.paidJobs !== 'No especificado' && (
          <span className="job-paid">
            ✓ {job.paidJobs}
          </span>
        )}
      </div>

      {/* Presupuesto */}
      {(job.budget || job.price) && (job.budget !== 'No especificado' || job.price !== 'No especificado') && (
        <div className="job-budget">
          💰 {job.budget || job.price}
        </div>
      )}

      {/* Tipo de proyecto (para Freelancer) */}
      {job.type && job.type !== 'No especificado' && (
        <div className="job-type">
          📋 {job.type}
        </div>
      )}

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="job-skills">
          {job.skills.map((skill, index) => (
            <span key={index} className="skill-badge">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Indicador de error si existe */}
      {job.error && (
        <div className="job-error">
          ⚠️ Error: {job.error}
        </div>
      )}
    </div>
  );
}
