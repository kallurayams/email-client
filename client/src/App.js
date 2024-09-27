import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import OutlookConnectPage from './components/OutlookConnectPage';
import SyncStatus from './components/SyncStatusPage';
import AuthHandler from './components/AuthHandler';

// Placeholder for your data page component
const DataPage = () => <div>Data Page</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/connect" />} />
        <Route path="/connect" element={<OutlookConnectPage />} />
        <Route path="/data" element={<DataPage />} />
        <Route path="/sync-status" element={<AuthHandler />} />
        <Route path="/sync" element={<SyncStatus />} />
      </Routes>
    </Router>
  );
}

export default App;