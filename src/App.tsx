import { ApiClient } from "@twurple/api";
import { StaticAuthProvider } from "@twurple/auth";
import React, { useEffect, useState } from "react";
import { BanDashboard } from "./components/ban-dashboard";

import "./App.css";

const App: React.FC = () => {
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);
  const [userID, setUserID] = useState<string | null>(null);

  const loginURL = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=v9lka3ztfepkdn0mdqihfewpzx495n&redirect_uri=${window.location.origin}/banned-user-dashboard/&scope=moderation:read`;

  // If access_token is in hash parameters, then get it and make an auth provider
  useEffect(() => {
    // if the access token is in local storage, don't try to get it from URL
    const localstorageAccessToken = localStorage.getItem(
      "banned-user-dashboard-access_token"
    );
    if (localstorageAccessToken) {
      const authProvider = new StaticAuthProvider(
        "v9lka3ztfepkdn0mdqihfewpzx495n",
        localstorageAccessToken
      );
      setApiClient(new ApiClient({ authProvider }));
      return;
    }

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    // Immediately remove access token from URL
    window.history.replaceState({}, document.title, window.location.pathname);

    if (accessToken) {
      // Save the access token in local storage
      localStorage.setItem("banned-user-dashboard-access_token", accessToken);

      const authProvider = new StaticAuthProvider(
        "v9lka3ztfepkdn0mdqihfewpzx495n",
        accessToken
      );
      setApiClient(new ApiClient({ authProvider }));
    }
  }, []);

  // Get user_id from apiClient
  useEffect(() => {
    if (apiClient) {
      apiClient
        .getTokenInfo()
        .then((tokenInfo) => {
          setUserID(tokenInfo.userId);
        })
        .catch((e) => {
          localStorage.removeItem("banned-user-dashboard-access_token");
        });
    }
  }, [apiClient]);

  if (apiClient && userID) {
    return <BanDashboard apiClient={apiClient} userID={userID} />;
  } else {
    return (
      <div>
        <a className="styled-button" href={loginURL}>
          Login with Twitch
        </a>
      </div>
    );
  }
};

export default App;
