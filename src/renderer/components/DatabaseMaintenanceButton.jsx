import React, { useState } from 'react';
import Button from './Button.jsx';
import Toast from './Toast.jsx';

export default function DatabaseMaintenanceButton() {
  const [isRunning, setIsRunning] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [toast, setToast] = useState(null);
  const [backups, setBackups] = useState([]);
  const [backupDirectory, setBackupDirectory] = useState('');

  const handleRunMaintenance = async () => {
    setIsRunning(true);
    try {
      const result = await window.maintenanceAPI.runDbMaintenance();
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

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    try {
      const result = await window.maintenanceAPI.createBackup();
      if (result.ok) {
        setToast({ message: 'Database backup created successfully!', type: 'success' });
        loadBackups(); // Refresh backup list
      } else {
        setToast({ message: 'Backup failed: ' + result.error, type: 'error' });
      }
    } catch (error) {
      console.error('Backup error:', error);
      setToast({ message: 'Backup failed: ' + error.message, type: 'error' });
    } finally {
      setIsBackingUp(false);
    }
  };

  const loadBackups = async () => {
    try {
      const result = await window.maintenanceAPI.listBackups();
      if (result.ok) {
        setBackups(result.backups);
      }
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  };

  const loadBackupDirectory = async () => {
    try {
      const result = await window.maintenanceAPI.getBackupDirectory();
      if (result.ok) {
        setBackupDirectory(result.directory);
      }
    } catch (error) {
      console.error('Failed to get backup directory:', error);
    }
  };

  React.useEffect(() => {
    loadBackups();
    loadBackupDirectory();
  }, []);

  const clearToast = () => setToast(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Button
          onClick={handleRunMaintenance}
          disabled={isRunning}
          className={isRunning ? 'loading' : ''}
        >
          {isRunning ? 'Running Maintenance...' : 'Run Database Maintenance'}
        </Button>

        <Button
          onClick={handleCreateBackup}
          disabled={isBackingUp}
          className={isBackingUp ? 'loading' : ''}
        >
          {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
        </Button>
      </div>

      {backupDirectory && (
        <div style={{ fontSize: '14px', color: '#666' }}>
          <strong>Backup Location:</strong> {backupDirectory}
        </div>
      )}

      {backups.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Recent Backups</h4>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {backups.slice(0, 5).map((backup, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  fontSize: '12px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <div>
                  <strong>{backup.filename}</strong>
                </div>
                <div>Created: {new Date(backup.created).toLocaleString()}</div>
                <div>Size: {(backup.size / 1024).toFixed(1)} KB</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
}
