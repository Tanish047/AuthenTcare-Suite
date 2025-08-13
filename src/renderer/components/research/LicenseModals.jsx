import React from 'react';
import Modal from '../Modal.jsx';

const LicenseModals = ({
  showLicenseModal,
  setShowLicenseModal,
  selectedMarket,
  newLicense,
  setNewLicense,
  handleAddLicense,
}) => {
  return (
    <Modal
      open={showLicenseModal}
      onClose={() => setShowLicenseModal(false)}
      title="Add License"
      actions={[
        <button key="cancel" onClick={() => setShowLicenseModal(false)}>
          Cancel
        </button>,
        <button key="save" onClick={handleAddLicense} disabled={!newLicense}>
          Save
        </button>,
      ]}
    >
      <form onSubmit={handleAddLicense} style={{ width: '100%' }}>
        <input
          type="text"
          value={newLicense}
          onChange={e => setNewLicense(e.target.value)}
          placeholder="License name"
          style={{ width: '100%', marginBottom: 16 }}
          autoFocus
          required
        />
      </form>
    </Modal>
  );
};

export default LicenseModals;
