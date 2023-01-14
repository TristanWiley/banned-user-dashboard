import { ApiClient, HelixBan } from '@twurple/api';
import React, { useState } from 'react';

import './index.css';

interface BanDashboardProps {
  apiClient: ApiClient;
  userID: string;
}

export const BanDashboard: React.FC<BanDashboardProps> = ({ apiClient, userID }) => {
  const [bannedUsers, setBannedUsers] = useState<HelixBan[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchBannedUsers = async () => {
    setLoading(true);
    const response = await apiClient.moderation.getBannedUsersPaginated(userID);
    // While lastKnownLimit is not 0 (i.e. we haven't been rate limited) and there are more pages, get the next page
    let users: HelixBan[] = [];
    let hasMore = true;
    while (hasMore) {
      const page = await response.getNext();
      if (page.length === 0) {
        hasMore = false;
        break;
      }
      users = [...users, ...page]

      // If we've been rate limited, wait for the rate limit to reset
      if (apiClient.lastKnownRemainingRequests && apiClient.lastKnownRemainingRequests <= 1 && apiClient.lastKnownResetDate) {
        const rateLimitReset = apiClient.lastKnownResetDate.getTime();
        const now = new Date().getTime();
        const timeToWait = rateLimitReset - now;
        await new Promise((resolve) => setTimeout(resolve, timeToWait));
      }
    }
    setBannedUsers(users);
  };

  // Fetch the banned users when the component mounts
  // Determine how many users each mod has banned
  // Display the list of mods in a table with the number of users they've banned
  let modBans = new Map<string, number>();
  bannedUsers?.forEach((user) => {
    if (modBans.has(user.moderatorDisplayName)) {
      modBans.set(user.moderatorDisplayName, modBans.get(user.moderatorDisplayName)! + 1);
    } else {
      modBans.set(user.moderatorDisplayName, 1);
    }
  });

  // Sort the map by number of bans
  modBans = new Map([...modBans.entries()].sort((a, b) => b[1] - a[1]));

  return (
    <div className="ban-dashboard">
      {/* Show total number of bans */}
      {bannedUsers && <h1>Total number of bans: {bannedUsers.length}</h1>}
      {bannedUsers === null && <button onClick={() => fetchBannedUsers()}>Fetch Banned Users</button>}
      {bannedUsers && bannedUsers?.length !== 0 && <table>
        <thead>
          <tr>
            <th>Moderator</th>
            <th>Number of Bans</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(modBans.entries()).map(([mod, numBans]) => (
            <tr key={mod}>
              <td>{mod}</td>
              <td>{numBans}</td>
            </tr>
          ))}
        </tbody>
      </table>}

      {bannedUsers && bannedUsers?.length === 0 && <p>No banned users</p>}
      {!bannedUsers && loading && <p>Loading...</p>}
    </div>
  );
};

