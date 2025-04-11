import { setStoredNetwork, getAvailableNetworks, getStoredNetwork } from '../lib/config';
import { useState } from 'react';

export default function NetworkSwitcher() {
  const [currentNetwork, setCurrentNetwork] = useState(getStoredNetwork());
  
  const switchNetwork = (network: string) => {
    setStoredNetwork(network);
    setCurrentNetwork(network);
    // Optionally reload the bot
  };

  return (
    <select 
      value={currentNetwork}
      onChange={(e) => switchNetwork(e.target.value)}
    >
      {getAvailableNetworks().map(network => (
        <option key={network} value={network}>
          {network}
        </option>
      ))}
    </select>
  );
}