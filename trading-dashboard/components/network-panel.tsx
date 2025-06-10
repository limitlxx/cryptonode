import { setStoredNetwork, getAvailableNetworks, getStoredNetwork } from '../lib/config';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'; 
import { Loader2 } from 'lucide-react';

export default function NetworkSwitcher() {
  const [currentNetwork, setCurrentNetwork] = useState(getStoredNetwork());
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const switchNetwork = async (network: string) => {
    setIsLoading(true);
    setStoredNetwork(network);
    setCurrentNetwork(network);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
    router.refresh();
  };

  return (
    <Select value={currentNetwork} onValueChange={switchNetwork} disabled={isLoading}>
      <SelectTrigger className="w-[180px]">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Switching...
          </div>
        ) : (
          <SelectValue placeholder="Select network" />
        )}
      </SelectTrigger>
      <SelectContent>
        {getAvailableNetworks().map(network => (
          <SelectItem key={network} value={network}>
            {network}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}