/**
 * Componente JobList
 * Vista de lista detallada para trabajos (más compacta y práctica)
 */

'use client';

export default function JobList({ jobs }) {
  const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'ahora';
  };

  const sourceColors = {
    'Workana': '#8B5CF6',
    'Freelancer': '#3B82F6',
  };

  return (
    <div className="job-list">
      <div className="job-list-header">
        <div className="col-source">Fuente</div>
        <div className="col-time">Tiempo</div>
        <div className="col-title">Título del Proyecto</div>
        <div className="col-location">Ubicación</div>
        <div className="col-budget">Presupuesto</div>
        <div className="col-skills">Skills</div>
      </div>
      
      {jobs.map(job => (
        <div key={job.id} className="job-list-item">
          <div className="col-source">
            <span 
              className="source-badge-small"
              style={{ backgroundColor: sourceColors[job.source] || '#6B7280' }}
            >
              {job.source === 'Workana' ? 'W' : 'F'}
            </span>
          </div>
          
          <div className="col-time">
            <span className="time-badge">{getTimeAgo(job.timestamp)}</span>
          </div>
          
          <div className="col-title">
            <a 
              href={job.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="job-list-link"
            >
              {job.title}
            </a>
            {job.type && job.type !== 'No especificado' && (
              <span className="type-indicator">{job.type === 'Por hora' ? '⏱️' : '💵'}</span>
            )}
          </div>
          
          <div className="col-location">
            <span className="location-text">📍 {job.country}</span>
          </div>
          
          <div className="col-budget">
            <span className="budget-text">
              {(job.budget || job.price) && (job.budget !== 'No especificado' || job.price !== 'No especificado')
                ? (job.budget || job.price)
                : '-'}
            </span>
          </div>
          
          <div className="col-skills">
            <div className="skills-compact">
              {job.skills && job.skills.length > 0 ? (
                <>
                  {job.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="skill-tag-small">
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="skill-more">+{job.skills.length - 3}</span>
                  )}
                </>
              ) : (
                <span className="no-skills">-</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
