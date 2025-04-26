import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'; 
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { formatEther } from 'viem';
import { useAccount, useWatchContractEvent, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractAddress, contractABI } from '@/config/contractConfig';
import { decodeEventLog, AbiEventNotFoundError } from 'viem';
import { useNotifications } from '@/contexts/NotificationContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Gig {
  _id: string;
  clientAddress: string;
  freelancerAddress?: string;
  description: string;
  budget: string;
  status: 'Open' | 'InProgress' | 'Completed' | 'Cancelled';
  contractGigId: string;
  escrowContractAddress: string;
  createdAt: string;
  updatedAt: string;
}

const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const BrowseContracts: React.FC = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventListenerError, setEventListenerError] = useState<string | null>(null);
  const { toast } = useToast();
  const { address: userAddress } = useAccount();
  const { addNotification } = useNotifications();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

  const fetchSingleGig = async (contractGigId: string): Promise<Gig | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/gigs`, {
        params: { contractGigId: contractGigId }
      });
      if (response.data && response.data.length > 0) {
        return response.data[0];
      } else {
        return null;
      }
    } catch (error: any) {
      toast({
        title: "Error Fetching New Gig",
        description: `Failed to fetch details for gig ${contractGigId} from backend: ${error.message}`,
        variant: "warning",
      });
      return null;
    }
  };

  const fetchGigs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/gigs`, {
        params: { status: 'Open' }
      });
      setGigs(response.data);
    } catch (error: any) {
      toast({
        title: "Error Loading Gigs",
        description: error.response?.data?.message || error.message || "Could not fetch gigs.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [toast, API_BASE_URL]);

  // Setup event listener with error handling and retry
  useEffect(() => {
    setEventListenerError(null);
    let unwatch: (() => void) | undefined;
    let isActive = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    const setupEventListener = async () => {
      if (!isActive) return;
      
      try {
        // Check if ethereum is available (without using it as a constructor)
        if (!window.ethereum) {
          console.warn("No ethereum provider available for event listening");
          setEventListenerError("No Web3 provider found. Please ensure your wallet is connected.");
          return;
        }
        
        const eventName = 'GigPosted';
        const gigPostedEventAbi = contractABI.find(
          (item) => item.type === 'event' && item.name === eventName
        );
        
        if (!gigPostedEventAbi) {
          console.error("Event ABI not found for GigPosted");
          setEventListenerError("Could not find event definition. Please refresh.");
          return;
        }

        // Use wagmi's useWatchContractEvent hook instead of direct ethereum access
        // This is already set up elsewhere in the component, so we'll rely on that
        
        // Reset error state if successful
        setEventListenerError(null);
        retryCount = 0;
      } catch (error: any) {
        console.error("Error setting up event listener:", error);
        
        // Only retry a limited number of times
        if (retryCount < maxRetries && isActive) {
          retryCount++;
          const delay = Math.min(1000 * retryCount, 5000); // Exponential backoff with max 5s
          setEventListenerError(`Event listener error. Retrying in ${delay/1000}s...`);
          
          setTimeout(() => {
            if (isActive) setupEventListener();
          }, delay);
        } else {
          setEventListenerError("Could not listen for new gig events. Please refresh the page.");
        }
      }
    };
    
    setupEventListener();
    
    // Cleanup function
    return () => {
      isActive = false;
      if (unwatch) {
        try {
          unwatch();
        } catch (err) {
          console.error("Error cleaning up event listener:", err);
        }
      }
    };
  }, [contractAddress, userAddress]);
  
  // Handle manual refresh when event listener fails
  const handleRefresh = () => {
    setEventListenerError(null);
    fetchGigs();
    // The event listener will be re-established by the effect
  };

  // Bid to stake on gig
  const { data: bidHash, error: bidError, isLoading: isBidPending, writeContract: writeBid } = useWriteContract();
  const { isLoading: isBidConfirming, isSuccess: isBidConfirmed } = useWaitForTransactionReceipt({ hash: bidHash });

  useEffect(() => {
    if (isBidPending) {
      toast({ title: 'Staking Bid...', description: `Waiting for your transaction...`, variant: 'default' });
    }
    if (isBidConfirmed) {
      toast({ title: 'Bid Staked!', description: 'You have staked tokens to bid on this gig.', variant: 'success' });
    }
    if (bidError) {
      toast({ title: 'Bid Failed', description: bidError.message, variant: 'destructive' });
    }
  }, [isBidPending, isBidConfirming, isBidConfirmed, bidError, toast]);

  const handleAcceptGig = async (gig: Gig) => {
    if (!userAddress) {
      toast({ title: "Not Connected", description: "Connect your wallet to accept gigs.", variant: "destructive" });
      return;
    }
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/v1/gigs/${gig.contractGigId}/select?escrowContractAddress=${gig.escrowContractAddress}`,
        { freelancerAddress: userAddress }
      );
      toast({ title: "Gig Accepted!", description: `You are now assigned to: ${gig.description}` });
      setGigs(prev => prev.filter(g => g._id !== gig._id));
      addNotification({
        text: `You accepted gig: "${gig.description.substring(0, 30)}${gig.description.length > 30 ? '...' : ''}"`,
        type: 'gig_accepted',
        read: false,
        link: '/my-contracts'
      });
    } catch (err: any) {
      toast({
        title: "Error Accepting Gig",
        description: err.response?.data?.message || err.message || "Could not accept gig.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading available gigs...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Gigs</h1>
      
      {/* Error alert with refresh button */}
      {eventListenerError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <div className="flex items-center justify-between">
            <AlertDescription>{eventListenerError}</AlertDescription>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-2 flex items-center">
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
          </div>
        </Alert>
      )}
      
      {gigs.length === 0 ? (
        <p className="text-center text-muted-foreground">No open gigs found at the moment. Check back later or post your own!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <Card key={gig._id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg truncate" title={gig.description}>{gig.description}</CardTitle>
                <CardDescription>
                  Posted by: <span className="font-mono text-xs" title={gig.clientAddress}>{truncateAddress(gig.clientAddress)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <div>
                  <p>Budget: <span className="font-semibold">{formatEther(BigInt(gig.budget))} ETH</span></p>
                </div>
                <div>
                  Status: <Badge variant={gig.status === 'Open' ? 'secondary' : 'default'}>{gig.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Blockchain ID: {gig.contractGigId}
                </div>
              </CardContent>
              <CardFooter>
                {/* Bid button for freelancers */}
                {gig.status === 'Open' && userAddress && gig.clientAddress.toLowerCase() !== userAddress.toLowerCase() && (
                  <Button onClick={() => writeBid({
                    address: contractAddress as `0x${string}`,
                    abi: contractABI,
                    functionName: 'bidGig',
                    args: [BigInt(gig.contractGigId)],
                  })} disabled={isBidPending} className="w-full mb-2">
                    {isBidPending ? 'Staking...' : 'Bid on Gig'}
                  </Button>
                )}
                {gig.status === 'Open' && gig.clientAddress.toLowerCase() !== userAddress?.toLowerCase() && (
                  <Button onClick={() => handleAcceptGig(gig)} className="w-full">
                    Accept Gig
                  </Button>
                )}
                {gig.clientAddress.toLowerCase() === userAddress?.toLowerCase() && (
                  <p className="text-xs text-muted-foreground w-full text-center">This is your gig.</p>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseContracts;
