import { useState } from 'react';
import { checkPassword } from '../utils/password.js';

export const useMarkets = (state, dispatch) => {
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showMarketEditModal, setShowMarketEditModal] = useState(false);
  const [showMarketDeleteModal, setShowMarketDeleteModal] = useState(false);
  const [newMarket, setNewMarket] = useState('');
  const [editMarket, setEditMarket] = useState('');
  const [editMarketName, setEditMarketName] = useState('');
  const [deleteMarket, setDeleteMarket] = useState('');
  const [marketDeletePassword, setMarketDeletePassword] = useState('');
  const [marketDeleteError, setMarketDeleteError] = useState('');

  const allMarkets = [
    'Australia',
    'Bangladesh',
    'Brunei',
    'Cambodia',
    'China',
    'Europe',
    'Hong Kong',
    'India',
    'Indonesia',
    'Japan',
    'Korea',
    'Lao',
    'Malaysia',
    'Maynmar',
    'Myanmar',
    'New Zealand',
    'Philippines',
    'Singapore',
    'Sri Lanka',
    'Taiwan',
    'Thailand',
    'USA',
    'Vietnam',
  ].sort();

  const handleCreateMarket = () => {
    if (newMarket && !state.targetMarkets.includes(newMarket)) {
      dispatch({ type: 'SET_TARGET_MARKETS', targetMarkets: [...state.targetMarkets, newMarket] });
      setShowMarketModal(false);
      setNewMarket('');
    }
  };

  const handleEditMarket = (oldMarket, newName) => {
    if (newName && oldMarket && !state.targetMarkets.includes(newName)) {
      dispatch({
        type: 'SET_TARGET_MARKETS',
        targetMarkets: state.targetMarkets.map(m => (m === oldMarket ? newName : m)),
      });
      setEditMarket('');
      setEditMarketName('');
      setShowMarketEditModal(false);
    }
  };

  const handleDeleteMarket = () => {
    if (checkPassword(marketDeletePassword)) {
      dispatch({
        type: 'SET_TARGET_MARKETS',
        targetMarkets: state.targetMarkets.filter(m => m !== deleteMarket),
      });
      setShowMarketDeleteModal(false);
      setDeleteMarket('');
      setMarketDeletePassword('');
      setMarketDeleteError('');
    } else {
      setMarketDeleteError('Incorrect password.');
    }
  };

  const handleCreateClick = () => {
    setShowMarketModal(true);
  };

  const handleEditClick = market => {
    setEditMarket(market);
    setEditMarketName(market);
    setShowMarketEditModal(true);
  };

  const handleDeleteClick = market => {
    setDeleteMarket(market);
    setShowMarketDeleteModal(true);
  };

  return {
    targetMarkets: state.targetMarkets,
    allMarkets,
    // Create
    showMarketModal,
    onCloseCreate: () => setShowMarketModal(false),
    newMarket,
    setNewMarket,
    onCreate: handleCreateClick,
    onCreateMarket: handleCreateMarket,
    // Edit
    showMarketEditModal,
    onCloseEdit: () => setShowMarketEditModal(false),
    editMarket,
    editMarketName,
    setEditMarketName,
    onEdit: handleEditClick,
    onEditMarket: handleEditMarket,
    // Delete
    showMarketDeleteModal,
    onCloseDelete: () => setShowMarketDeleteModal(false),
    marketDeletePassword,
    setMarketDeletePassword,
    marketDeleteError,
    onDelete: handleDeleteClick,
    onDeleteMarket: handleDeleteMarket,
  };
};
