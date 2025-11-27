import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaProviderProps {
  children: React.ReactNode;
}

export function SolanaProvider({ children }: SolanaProviderProps) {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function WalletButton() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    const shortAddress = `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2"
            data-testid="button-wallet-connected"
          >
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>{shortAddress}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => disconnect()}
            className="gap-2 text-destructive focus:text-destructive"
            data-testid="button-wallet-disconnect"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      onClick={() => setVisible(true)}
      className="gap-2"
      data-testid="button-wallet-connect"
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}

export function useWalletBalance() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["wallet-balance", publicKey?.toString()],
    queryFn: async () => {
      if (!publicKey) return null;
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    },
    enabled: !!publicKey,
    refetchInterval: 30000,
  });
}

export function WalletStatus() {
  const { publicKey, connected, connecting, disconnecting } = useWallet();
  const { data: balance, isLoading: balanceLoading } = useWalletBalance();

  if (connecting) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
        <span>Connecting...</span>
      </div>
    );
  }

  if (disconnecting) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
        <span>Disconnecting...</span>
      </div>
    );
  }

  if (connected && publicKey) {
    const shortAddress = `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`;
    return (
      <div className="flex flex-col gap-1" data-testid="wallet-status-connected">
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="font-medium">{shortAddress}</span>
        </div>
        {!balanceLoading && balance !== null && balance !== undefined && (
          <span className="text-xs text-muted-foreground">
            {balance.toFixed(4)} SOL
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="wallet-status-disconnected">
      <div className="h-2 w-2 rounded-full bg-gray-400" />
      <span>Not connected</span>
    </div>
  );
}

export { useWallet, useConnection };
