import React from 'react';
import './LoadingPage.css'; // Import the CSS file
import mangoLogo from '../../src/images/mango-logo.png';

function LoadingPage() {
  return (
    <div id="loading-container">
      <div className="logo-container">
        <img src={mangoLogo} alt="Mango Logo" className="loading-logo" />
      </div>
      <div className="spinner"></div>
      <p className="loading-text">Loading your finances...</p>
    </div>
  );
}

export default LoadingPage;