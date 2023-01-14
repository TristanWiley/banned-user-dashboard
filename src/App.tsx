import { ApiClient } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';
import React, { useEffect, useState, } from 'react';
import { BanDashboard } from './components/ban-dashboard';

const App: React.FC = () => {
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);
  const [userID, setUserID] = useState<string | null>(null);

  const handleLogin = async () => {
    window.location.href = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=v9lka3ztfepkdn0mdqihfewpzx495n&redirect_uri=${window.location.origin}&scope=moderation:read`
  }

  // If access_token is in hash parameters, then get it and make an auth provider
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    if (accessToken) {
      const authProvider = new StaticAuthProvider('v9lka3ztfepkdn0mdqihfewpzx495n', accessToken);
      setApiClient(new ApiClient({ authProvider }));
    }
  }, []);

  // Get user_id from apiClient
  useEffect(() => {
    if (apiClient) {
      apiClient.getTokenInfo().then((tokenInfo) => {
        setUserID(tokenInfo.userId);
      });
    }
  }, [apiClient]);

  if (apiClient && userID) {
    return <BanDashboard apiClient={apiClient} userID={userID} />;
  } else {
    return (
      <div>
        <button onClick={handleLogin}>Login with Twitch</button>
      </div>
    );
  }
}

export default App;

