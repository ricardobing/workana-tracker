/**
 * Componente JobCard
 * Muestra la información de un trabajo individual de Workana
 */

'use client';

export default function JobCard({ job }) {
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
      {job.budget && job.budget !== 'No especificado' && (
        <div className="job-budget">
          💰 {job.budget}
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
