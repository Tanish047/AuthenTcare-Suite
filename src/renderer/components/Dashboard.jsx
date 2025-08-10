import React from 'react';

function Dashboard({ dashboardRef }) {
  return (
    <div
      ref={dashboardRef ? dashboardRef : undefined}
      className="dashboard-container"
      style={{ marginTop: 32, marginLeft: 32, textAlign: 'left', maxWidth: 900 }}
    >
      <h1 className="superlist-hero-title">Welcome to AuthenTcare Suite<span className="superlist-hero-gradient"></span></h1>
      <p className="superlist-hero-subtitle">Your hybrid regulatory management tool.</p>
    </div>
  );
}

export default Dashboard;