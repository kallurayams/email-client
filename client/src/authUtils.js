// authUtils.js
import { useNavigate } from "react-router-dom";
import config from "./config";

export const handleAuthError = async (response, navigate) => {
  if (response.status === 401 || response.status === 403) {
    try {
      const refreshTokenResponse = await fetch(
        `${config.apiBaseUrl}/auth/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      if (refreshTokenResponse.ok) {
        const data = await refreshTokenResponse.json();
        sessionStorage.setItem("authToken", data.authToken);
        return false; // Continue with the original request
      } else {
        sessionStorage.clear();
        navigate("/"); // Redirect to homepage
        return true; // Stop further processing
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      sessionStorage.clear();
      navigate("/"); // Redirect to homepage
      return true; // Stop further processing
    }
  }
  return false; // No auth error, continue with the original request
};
