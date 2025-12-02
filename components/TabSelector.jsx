/**
 * Componente TabSelector
 * Selector de pestañas para cambiar entre fuentes (Workana, Freelancer, Todos)
 */

'use client';

export default function TabSelector({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'workana', label: '💼 Workana', color: '#8B5CF6' },
    { id: 'freelancer', label: '💻 Freelancer', color: '#3B82F6' },
    { id: 'all', label: '🌐 Todos', color: '#10B981' },
  ];

  return (
    <div className="tab-selector">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          style={{
            '--tab-color': tab.color,
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
