import React from 'react';
import Modal from '../Modal.jsx';

const MarketModals = ({
  // Edit
  showEdit,
  onCloseEdit,
  editMarket,
  editMarketName,
  setEditMarketName,
  editMarketRegion,
  setEditMarketRegion,
  editMarketRegulatoryBody,
  setEditMarketRegulatoryBody,
  editMarketRequirements,
  setEditMarketRequirements,
  onEditMarket,
  // Delete
  showDelete,
  onCloseDelete,
  deleteMarket,
  marketDeletePassword,
  setMarketDeletePassword,
  marketDeleteError,
  onDeleteMarket,
  // Loading
  loading = false,
}) => {
  return (
    <>
      {/* Edit Market Modal */}
      <Modal
        open={showEdit}
        onClose={onCloseEdit}
        title="Edit Market"
        actions={[
          <button key="cancel" onClick={onCloseEdit} disabled={loading}>
            Cancel
          </button>,
          <button
            key="save"
            onClick={onEditMarket}
            disabled={
              loading ||
              !editMarketName ||
              (editMarketName === editMarket?.name &&
                editMarketRegion === (editMarket?.region || '') &&
                editMarketRegulatoryBody === (editMarket?.regulatory_body || '') &&
                editMarketRequirements === (editMarket?.requirements || ''))
            }
          >
            {loading ? 'Saving...' : 'Save'}
          </button>,
        ]}
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            onEditMarket();
          }}
          style={{ width: '100%' }}
        >
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: '600' }}>
              Market Name *
            </label>
            <input
              type="text"
              value={editMarketName}
              onChange={e => setEditMarketName(e.target.value)}
              placeholder="Enter market name"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: '600' }}>Region</label>
            <input
              type="text"
              value={editMarketRegion}
              onChange={e => setEditMarketRegion(e.target.value)}
              placeholder="Enter region (e.g., Asia-Pacific, Europe)"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: '600' }}>
              Regulatory Body
            </label>
            <input
              type="text"
              value={editMarketRegulatoryBody}
              onChange={e => setEditMarketRegulatoryBody(e.target.value)}
              placeholder="Enter regulatory body (e.g., FDA, EMA, TGA)"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: '600' }}>
              Requirements
            </label>
            <textarea
              value={editMarketRequirements}
              onChange={e => setEditMarketRequirements(e.target.value)}
              placeholder="Enter specific regulatory requirements"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                minHeight: '80px',
                resize: 'vertical',
              }}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Market Modal */}
      <Modal
        open={showDelete}
        onClose={() => {
          onCloseDelete();
          setMarketDeletePassword('');
        }}
        title="Remove Market from Version"
        actions={[
          <button key="cancel" onClick={onCloseDelete} disabled={loading}>
            Cancel
          </button>,
          <button
            key="delete"
            onClick={onDeleteMarket}
            disabled={loading || !marketDeletePassword}
            style={{ backgroundColor: '#dc3545', color: 'white' }}
          >
            {loading ? 'Removing...' : 'Remove'}
          </button>,
        ]}
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            onDeleteMarket();
          }}
          style={{ width: '100%' }}
        >
          <p style={{ marginBottom: 16 }}>
            Are you sure you want to remove <strong>{deleteMarket?.name}</strong> from this version?
            This will not delete the market from the database, only remove it from this specific
            version.
          </p>
          <input
            type="password"
            value={marketDeletePassword}
            onChange={e => setMarketDeletePassword(e.target.value)}
            placeholder="Enter password to confirm"
            style={{
              width: '100%',
              marginBottom: 8,
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
            required
          />
          {marketDeleteError && (
            <p style={{ color: '#dc3545', marginTop: 8, fontSize: '14px' }}>{marketDeleteError}</p>
          )}
        </form>
      </Modal>
    </>
  );
};

export default MarketModals;
