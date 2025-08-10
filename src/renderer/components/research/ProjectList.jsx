import React, { useState } from 'react';

const ProjectList = ({
  projects,
  selectedProject,
  onSelect,
  onCreate,
  onEdit,
  onDelete
}) => {
  const [openMenu, setOpenMenu] = useState(null);

  const handleMenuClick = (e, projectId) => {
    e.stopPropagation();
    setOpenMenu(openMenu === projectId ? null : projectId);
  };

  const handleDeleteClick = (e, project) => {
    e.stopPropagation();
    setOpenMenu(null);
    onDelete(project);
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 20 }}>
        <button
          onClick={onCreate}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            backgroundColor: '#2c5aa0',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px'
          }}
        >
          <span>+</span>
          Create New Project
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {projects && projects.length > 0 ? (
          projects.map(project => (
            <li 
              key={project.id} 
              style={{ 
                marginBottom: 12,
                background: selectedProject === project.id ? '#f0f7ff' : '#fff',
                border: '1px solid ' + (selectedProject === project.id ? '#2c5aa0' : '#e0e0e0'),
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <div 
                style={{ 
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }} 
                onClick={() => onSelect(project)}
              >
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#2c5aa0' }}>{project.name}</h4>
                  <small style={{ color: '#666' }}>Click to view project details</small>
                </div>
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={(e) => handleMenuClick(e, project.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    ⋯
                  </button>
                  {openMenu === project.id && (
                    <div 
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        minWidth: '120px'
                      }}
                    >
                      <button
                        onClick={(e) => handleDeleteClick(e, project)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          color: '#d63031'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))
        ) : (
          <li style={{ color: '#888' }}>No projects available.</li>
        )}
      </ul>
    </div>
  );
};

export default ProjectList;
