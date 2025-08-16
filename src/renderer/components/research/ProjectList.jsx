import React, { useState } from 'react';
import ActionMenu from '../ActionMenu.jsx';

const ProjectList = ({ projects, selectedProject, onSelect, onCreate, onEdit, onDelete }) => {

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
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
            fontSize: '14px',
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
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onClick={() => onSelect(project)}
              >
                <div>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      margin: 0,
                      color: '#2c5aa0',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      textAlign: 'left',
                      textDecoration: 'underline',
                      textDecorationColor: 'transparent',
                      transition: 'text-decoration-color 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.target.style.textDecorationColor = '#2c5aa0';
                    }}
                    onMouseLeave={e => {
                      e.target.style.textDecorationColor = 'transparent';
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      onSelect(project);
                    }}
                  >
                    {project.name}
                  </button>
                  <small style={{ display: 'block', color: '#666', marginTop: '4px' }}>
                    Click project name to view details
                  </small>
                </div>
                <ActionMenu
                  actions={[
                    {
                      key: 'edit',
                      label: 'Edit',
                      icon: '✏️',
                      onClick: () => onEdit(project)
                    },
                    {
                      key: 'delete',
                      label: 'Delete',
                      icon: '🗑️',
                      danger: true,
                      onClick: () => onDelete(project)
                    }
                  ]}
                />
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
