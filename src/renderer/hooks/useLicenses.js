import { useState } from 'react';

export const useLicenses = (state, dispatch, selectedMarket) => {
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [newLicense, setNewLicense] = useState('');

  const handleCreateLicense = () => {
    if (selectedMarket && newLicense) {
      const licenses = state.marketLicenses[selectedMarket] || [];
      if (!licenses.includes(newLicense)) {
        dispatch({
          type: 'SET_MARKET_LICENSES',
          marketLicenses: {
            ...state.marketLicenses,
            [selectedMarket]: [...licenses, newLicense],
          },
        });
        setShowLicenseModal(false);
        setNewLicense('');
      }
    }
  };

  const handleDeleteLicense = (market, license) => {
    const licenses = state.marketLicenses[market] || [];
    dispatch({
      type: 'SET_MARKET_LICENSES',
      marketLicenses: {
        ...state.marketLicenses,
        [market]: licenses.filter(l => l !== license),
      },
    });
  };

  const handleCreateClick = () => {
    setShowLicenseModal(true);
  };

  const handleDeleteClick = license => {
    handleDeleteLicense(selectedMarket, license);
  };

  return {
    licenses: state.marketLicenses[selectedMarket] || [],
    showLicenseModal,
    onCloseCreate: () => setShowLicenseModal(false),
    newLicense,
    setNewLicense,
    onCreate: handleCreateClick,
    onDelete: handleDeleteClick,
    onCreateLicense: handleCreateLicense,
    handleCreateLicense,
    handleDeleteClick,
  };
};
