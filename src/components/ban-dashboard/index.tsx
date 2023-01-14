import { ApiClient, HelixBan } from '@twurple/api';
import React, { useState } from 'react';

// Create a props interface for the BanDashboard component
interface BanDashboardProps {
  apiClient: ApiClient;
  userID: string;
}

/**
 * Create a new functional component named BanDashboard that will take an apiClient prop
 * and calls the API to get the list of banned users, paginated. Then displays them in a table.
 */
export const BanDashboard: React.FC<BanDashboardProps> = ({ apiClient, userID }) => {
  const [bannedUsers, setBannedUsers] = useState<HelixBan[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchBannedUsers = async () => {
    setLoading(true);
    const response = await apiClient.moderation.getBannedUsersPaginated(userID);
    const users = await response.getAll();
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

  // While the fetch is happening, display a loading message
  return (
    <div>
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

  // return (
  //   <div>
  //     <button onClick={() => fetchBannedUsers()}>Fetch Banned Users</button>
  //     <table>
  //       <thead>
  //         <tr>
  //           <th>Username</th>
  //           <th>Ban Reason</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {bannedUsers.map((user) => (
  //           <tr key={user.userId}>
  //             <td>{user.userDisplayName}</td>
  //             <td>{user.moderatorDisplayName}</td>
  //           </tr>
  //         ))}
  //       </tbody>
  //     </table>
  //   </div>
  // );
};

