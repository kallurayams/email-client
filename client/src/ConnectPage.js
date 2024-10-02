import React from "react";
import "./ConnectPage.css";
import config from "./config";
import { handleAuthError } from "./authUtils";
import { useNavigate } from "react-router-dom";

function ConnectPage() {
  const navigate = useNavigate();
  const handleConnect = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/auth/generate-auth-url?provider=outlook`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.data.authUrl) {
        window.location.href = data.data.authUrl;
      } else {
        console.error("authUrl not found in response");
      }
    } catch (error) {
      console.error("Error fetching authUrl:", error);
    }
  };

  return (
    <div className="connect-page">
      <h1>Connect to Outlook</h1>
      <button onClick={handleConnect}>Connect</button>
    </div>
  );
}

export default ConnectPage;
