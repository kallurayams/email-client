import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "./config";
import { handleAuthError } from "./authUtils";

function OAuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccountInfo = async (authToken) => {
      try {
        const response = await axios.get(
          config.apiBaseUrl + "/auth/account-info",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (await handleAuthError(response, navigate)) return;

        const localUserId = response.data.data.localUserId;
        sessionStorage.setItem("localUserId", localUserId);
        navigate("/sync-in-progress");
      } catch (error) {
        console.error("Failed to fetch account info", error);
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      sessionStorage.setItem("authToken", code);
      fetchAccountInfo(code);
    } else {
      console.error("Authorization code not found in URL");
    }
  }, [navigate]);

  return <div>Redirecting...</div>;
}

export default OAuthRedirect;
