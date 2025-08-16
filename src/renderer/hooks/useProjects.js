import { useState, useCallback, useEffect } from 'react';
import { checkPassword } from '../utils/password.js';

export const useProjects = (state, dispatch) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editProjectName, setEditProjectName] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear any pending operations when component unmounts
      setLoading(false);
      setError(null);
      dispatch({ type: 'CLEAR_LOADING', key: 'projects' });
      dispatch({ type: 'CLEAR_ERROR', key: 'projects' });
    };
  }, [dispatch]);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading projects...');
      const result = await window.dbAPI.getProjects();
      console.log('Projects loaded:', result);
      dispatch({ type: 'SET_PROJECTS', projects: result.data });
    } catch (err) {
      setError(err.message);
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const handleCreateProject = async e => {
    e.preventDefault();
    console.log('handleCreateProject called with name:', newProjectName);
    
    if (!newProjectName.trim()) {
      console.log('Project name is empty, returning');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Creating project with data:', { name: newProjectName.trim() });
      
      const project = await window.dbAPI.createProject({
        name: newProjectName.trim(),
      });
      
      console.log('Project created successfully:', project);
      dispatch({ type: 'ADD_PROJECT', project });
      setShowCreateModal(false);
      setNewProjectName('');
    } catch (err) {
      setError(err.message);
      console.error('Failed to create project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = async e => {
    e.preventDefault();
    if (!editProjectName.trim() || !editingProject) return;

    try {
      setLoading(true);
      setError(null);
      const updated = await window.dbAPI.updateProject(editingProject.id, {
        name: editProjectName.trim(),
      });
      dispatch({ type: 'UPDATE_PROJECT', project: updated });
      setShowEditModal(false);
      setEditProjectName('');
      setEditingProject(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to update project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async e => {
    e.preventDefault();
    if (!deleteProject || !checkPassword(deletePassword)) {
      setDeleteError('Incorrect password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await window.dbAPI.deleteProject(deleteProject.id);
      dispatch({ type: 'REMOVE_PROJECT', id: deleteProject.id });
      setShowDeleteModal(false);
      setDeleteProject(null);
      setDeletePassword('');
      setDeleteError('');
    } catch (err) {
      setDeleteError(err.message);
      console.error('Failed to delete project:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    projects: state.projects, // Add projects from state
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDeleteModal,
    setShowDeleteModal,
    newProjectName,
    setNewProjectName,
    editProjectName,
    setEditProjectName,
    editingProject,
    setEditingProject,
    deleteProject,
    setDeleteProject, // This was missing!
    deletePassword,
    setDeletePassword,
    deleteError,
    loading,
    error,
    loadProjects,
    handleCreateProject,
    handleEditProject,
    handleDeleteProject,
  };
};
