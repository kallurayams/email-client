import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "./config";
import { handleAuthError } from "./authUtils";

function SyncInProgress() {
  const navigate = useNavigate();
  const [isResyncing, setIsResyncing] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/sync/process-status`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );

        if (await handleAuthError(response, navigate)) return;

        const data = await response.json();

        if (!data.data.isResyncing) {
          navigate("/final-page"); // Replace with your final page route
        } else {
          setIsResyncing(true);
        }
      } catch (error) {
        console.error("Error fetching status:", error);
      }
    };

    const intervalId = setInterval(checkStatus, 3000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  return <div>Initial sync in progress...</div>;
}

export default SyncInProgress;
