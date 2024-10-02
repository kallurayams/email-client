import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ConnectPage from "./ConnectPage";
import OAuthRedirect from "./OAuthRedirect";
import SyncInProgress from "./SyncInProgress";
import FinalPage from "./FinalPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ConnectPage />} />
        <Route path="/oauth-redirect" element={<OAuthRedirect />} />
        <Route path="/sync-in-progress" element={<SyncInProgress />} />
        <Route path="/final-page" element={<FinalPage />} />
      </Routes>
    </Router>
  );
}

export default App;
