import { useState, useCallback, useEffect } from 'react';
import { checkPassword } from '../utils/password.js';

export const useMarkets = (state, dispatch, selectedVersion = null) => {
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showMarketEditModal, setShowMarketEditModal] = useState(false);
  const [showMarketDeleteModal, setShowMarketDeleteModal] = useState(false);
  const [newMarket, setNewMarket] = useState('');
  const [editMarket, setEditMarket] = useState(null);
  const [editMarketName, setEditMarketName] = useState('');
  const [editMarketRegion, setEditMarketRegion] = useState('');
  const [editMarketRegulatoryBody, setEditMarketRegulatoryBody] = useState('');
  const [editMarketRequirements, setEditMarketRequirements] = useState('');
  const [deleteMarket, setDeleteMarket] = useState(null);
  const [marketDeletePassword, setMarketDeletePassword] = useState('');
  const [marketDeleteError, setMarketDeleteError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get version-specific markets
  const versionMarkets = selectedVersion ? state.versionMarkets[selectedVersion.id] || [] : [];

  // Load version markets when version changes
  const loadVersionMarkets = useCallback(async () => {
    if (!selectedVersion) return;

    try {
      setLoading(true);
      const result = await window.dbAPI.getVersionMarkets(selectedVersion.id);
      dispatch({
        type: 'SET_VERSION_MARKETS',
        versionId: selectedVersion.id,
        markets: result.data || [],
      });
    } catch (error) {
      console.error('Error loading version markets:', error);
      setError('Failed to load markets for this version');
    } finally {
      setLoading(false);
    }
  }, [selectedVersion, dispatch]);

  // Load all available markets
  const loadAllMarkets = useCallback(async () => {
    try {
      const result = await window.dbAPI.getMarkets();
      dispatch({ type: 'SET_ALL_MARKETS', markets: result.data || [] });
    } catch (error) {
      console.error('Error loading all markets:', error);
    }
  }, [dispatch]);

  // Load markets on version change
  useEffect(() => {
    if (selectedVersion) {
      loadVersionMarkets();
    }
  }, [selectedVersion, loadVersionMarkets]);

  // Load all markets on mount
  useEffect(() => {
    loadAllMarkets();
  }, [loadAllMarkets]);

  const handleAddMarketToVersion = async marketId => {
    if (!selectedVersion) return;

    try {
      setLoading(true);
      const market = await window.dbAPI.addVersionMarket(selectedVersion.id, marketId);
      dispatch({
        type: 'ADD_VERSION_MARKET',
        versionId: selectedVersion.id,
        market,
      });
      setError('');
    } catch (error) {
      console.error('Error adding market to version:', error);
      setError(error.message || 'Failed to add market to version');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMarket = async () => {
    if (!editMarket) return;

    try {
      setLoading(true);
      const updatedMarket = await window.dbAPI.updateMarket(editMarket.id, {
        name: editMarketName,
        region: editMarketRegion,
        regulatory_body: editMarketRegulatoryBody,
        requirements: editMarketRequirements,
      });

      // Update the market in all relevant places
      dispatch({
        type: 'SET_ALL_MARKETS',
        markets: state.allMarkets.map(m => (m.id === editMarket.id ? updatedMarket : m)),
      });

      // Update in version markets if present
      if (selectedVersion && versionMarkets.some(m => m.id === editMarket.id)) {
        dispatch({
          type: 'SET_VERSION_MARKETS',
          versionId: selectedVersion.id,
          markets: versionMarkets.map(m => (m.id === editMarket.id ? updatedMarket : m)),
        });
      }

      setShowMarketEditModal(false);
      resetEditForm();
      setError('');
    } catch (error) {
      console.error('Error updating market:', error);
      setError(error.message || 'Failed to update market');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMarket = async () => {
    if (!deleteMarket || !checkPassword(marketDeletePassword)) {
      setMarketDeleteError('Incorrect password.');
      return;
    }

    try {
      setLoading(true);

      if (selectedVersion) {
        // Remove from version-specific markets
        await window.dbAPI.removeVersionMarket(selectedVersion.id, deleteMarket.id);
        dispatch({
          type: 'REMOVE_VERSION_MARKET',
          versionId: selectedVersion.id,
          marketId: deleteMarket.id,
        });
      }

      setShowMarketDeleteModal(false);
      resetDeleteForm();
      setError('');
    } catch (error) {
      console.error('Error removing market from version:', error);
      setMarketDeleteError(error.message || 'Failed to remove market');
    } finally {
      setLoading(false);
    }
  };

  const resetEditForm = () => {
    setEditMarket(null);
    setEditMarketName('');
    setEditMarketRegion('');
    setEditMarketRegulatoryBody('');
    setEditMarketRequirements('');
  };

  const resetDeleteForm = () => {
    setDeleteMarket(null);
    setMarketDeletePassword('');
    setMarketDeleteError('');
  };

  const handleCreateClick = () => {
    setShowMarketModal(true);
  };

  const handleEditClick = market => {
    setEditMarket(market);
    setEditMarketName(market.name || '');
    setEditMarketRegion(market.region || '');
    setEditMarketRegulatoryBody(market.regulatory_body || '');
    setEditMarketRequirements(market.requirements || '');
    setShowMarketEditModal(true);
  };

  const handleDeleteClick = market => {
    setDeleteMarket(market);
    setShowMarketDeleteModal(true);
  };

  const handleBulkDeleteMarkets = async marketIds => {
    if (!selectedVersion || marketIds.length === 0) return;

    try {
      setLoading(true);

      // Remove all selected markets from version
      for (const marketId of marketIds) {
        await window.dbAPI.removeVersionMarket(selectedVersion.id, marketId);
        dispatch({
          type: 'REMOVE_VERSION_MARKET',
          versionId: selectedVersion.id,
          marketId: marketId,
        });
      }

      setError('');
    } catch (error) {
      console.error('Error removing markets from version:', error);
      setError(error.message || 'Failed to remove markets');
      throw error; // Re-throw to let the component handle the error display
    } finally {
      setLoading(false);
    }
  };

  return {
    // Data
    markets: versionMarkets,
    allMarkets: state.allMarkets,
    loading,
    error,

    // Create
    showMarketModal,
    setShowMarketModal,
    newMarket,
    setNewMarket,
    handleCreateClick,
    handleAddMarketToVersion,

    // Edit
    showMarketEditModal,
    setShowMarketEditModal,
    editMarket,
    editMarketName,
    setEditMarketName,
    editMarketRegion,
    setEditMarketRegion,
    editMarketRegulatoryBody,
    setEditMarketRegulatoryBody,
    editMarketRequirements,
    setEditMarketRequirements,
    handleEditClick,
    handleEditMarket,

    // Delete
    showMarketDeleteModal,
    setShowMarketDeleteModal,
    deleteMarket,
    marketDeletePassword,
    setMarketDeletePassword,
    marketDeleteError,
    handleDeleteClick,
    handleDeleteMarket,

    // Utility
    loadVersionMarkets,
    resetEditForm,
    resetDeleteForm,
    handleBulkDeleteMarkets,
  };
};
