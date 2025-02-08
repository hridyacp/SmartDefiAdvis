import { useState, useCallback } from 'react';
import { connectWallet, mintNFT } from '@/lib/web3';
import { type ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const { toast } = useToast();

  const connect = useCallback(async () => {
    try {
      const { signer: walletSigner, address: walletAddress } = await connectWallet();
      setSigner(walletSigner);
      setAddress(walletAddress);
      return true;
    } catch (error) {
      toast({
        title: "Wallet Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const mint = useCallback(async (achievementMetadata: string) => {
    if (!signer) {
      throw new Error("Please connect your wallet first");
    }
    return mintNFT(signer, achievementMetadata);
  }, [signer]);

  return {
    address,
    signer,
    connect,
    mint,
    isConnected: !!address,
  };
}
