import React, { useState } from 'react';
import Button from './Button.jsx';
import Toast from './Toast.jsx';

export default function DatabaseMaintenanceButton() {
  const [isRunning, setIsRunning] = useState(false);
  const [toast, setToast] = useState(null);

  const handleRunMaintenance = async () => {
    setIsRunning(true);
    try {
      const result = await window.electronAPI.runDbMaintenance();
      if (result.ok) {
        setToast({ message: 'Database maintenance completed successfully!', type: 'success' });
      } else {
        setToast({ message: 'Database maintenance failed', type: 'error' });
      }
    } catch (error) {
      console.error('Database maintenance error:', error);
      setToast({ message: 'Database maintenance failed: ' + error.message, type: 'error' });
    } finally {
      setIsRunning(false);
    }
  };

  const clearToast = () => setToast(null);

  return (
    <>
      <Button 
        onClick={handleRunMaintenance} 
        disabled={isRunning}
        className={isRunning ? 'loading' : ''}
      >
        {isRunning ? 'Running Maintenance...' : 'Run Database Maintenance'}
      </Button>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={clearToast} 
        />
      )}
    </>
  );
}