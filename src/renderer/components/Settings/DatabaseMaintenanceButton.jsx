import React, { useState } from 'react';

export default function DatabaseMaintenanceButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const runMaintenance = async () => {
    setBusy(true);
    setMsg('');
    try {
      await window.maintenanceAPI.run();
      setMsg('DB maintenance completed.');
    } catch (e) {
      setMsg(`Maintenance failed: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={runMaintenance} disabled={busy}>
        {busy ? 'Running…' : 'Run DB maintenance'}
      </button>
      {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
