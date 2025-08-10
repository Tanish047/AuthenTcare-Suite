import React from 'react';
import Modal from '../Modal.jsx';

const MarketModals = ({
  // Create
  showCreate,
  onCloseCreate,
  newMarket,
  setNewMarket,
  onCreateMarket,
  // Edit
  showEdit,
  onCloseEdit,
  editMarket,
  editMarketName,
  setEditMarketName,
  onEditMarket,
  // Delete
  showDelete,
  onCloseDelete,
  deleteMarket,
  marketDeletePassword,
  setMarketDeletePassword,
  marketDeleteError,
  onDeleteMarket,
  // Data
  allMarkets,
  targetMarkets
}) => {
  return (
    <>
      <Modal
        open={showCreate}
        onClose={onCloseCreate}
        title="Add Market"
        actions={[
          <button key="cancel" onClick={onCloseCreate}>Cancel</button>,
          <button key="save" onClick={onCreateMarket} disabled={!newMarket}>Save</button>
        ]}
      >
        <form onSubmit={(e) => { e.preventDefault(); onCreateMarket(); }} style={{ width: '100%' }}>
          <select 
            value={newMarket} 
            onChange={e => setNewMarket(e.target.value)} 
            style={{ width: '100%', marginBottom: 16 }} 
            required
          >
            <option value="" disabled>Select a market...</option>
            {allMarkets.filter(m => !targetMarkets.includes(m)).map(market => (
              <option key={market} value={market}>{market}</option>
            ))}
          </select>
        </form>
      </Modal>

      <Modal
        open={showDelete}
        onClose={() => { onCloseDelete(); setMarketDeletePassword(''); }}
        title="Delete Market"
        actions={[
          <button key="cancel" onClick={onCloseDelete}>Cancel</button>,
          <button key="delete" onClick={onDeleteMarket} disabled={!marketDeletePassword}>
            Delete
          </button>
        ]}
      >
        <form onSubmit={(e) => { e.preventDefault(); onDeleteMarket(); }} style={{ width: '100%' }}>
          <p style={{ marginBottom: 16 }}>
            Are you sure you want to delete {deleteMarket}? This action cannot be undone.
          </p>
          <input
            type="password"
            value={marketDeletePassword}
            onChange={e => setMarketDeletePassword(e.target.value)}
            placeholder="Enter password to confirm"
            style={{ width: '100%', marginBottom: 8 }}
            required
          />
          {marketDeleteError && <p style={{ color: 'red', marginTop: 8 }}>{marketDeleteError}</p>}
        </form>
      </Modal>

      <Modal
        open={showEdit}
        onClose={onCloseEdit}
        title="Edit Market"
        actions={[
          <button key="cancel" onClick={onCloseEdit}>Cancel</button>,
          <button key="save" onClick={onEditMarket} disabled={!editMarketName || editMarketName === editMarket}>
            Save
          </button>
        ]}
      >
        <form onSubmit={(e) => { e.preventDefault(); onEditMarket(); }} style={{ width: '100%' }}>
          <input
            type="text"
            value={editMarketName}
            onChange={e => setEditMarketName(e.target.value)}
            placeholder="Enter new market name"
            style={{ width: '100%', marginBottom: 16 }}
            required
          />
        </form>
      </Modal>
    </>
  );
};

export default MarketModals;
