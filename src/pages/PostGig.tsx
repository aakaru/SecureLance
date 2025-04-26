import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, decodeEventLog, AbiEventNotFoundError } from 'viem';
import { contractAddress, contractABI } from '@/config/contractConfig';
import axios from 'axios';
import { useNotifications } from '@/contexts/NotificationContext';
import { XCircle, PlusCircle } from 'lucide-react';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const PostGig: React.FC = () => {
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState([{ description: '', amount: '' }]);
  const { toast } = useToast();
  const { address: accountAddress, isConnected } = useAccount();
  const { data: hash, error: writeError, isPending: isWritePending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmationError, data: receipt } = useWaitForTransactionReceipt({ hash });
  const [extractedGigId, setExtractedGigId] = useState<string | null>(null);
  const [isBackendLoading, setIsBackendLoading] = useState(false);
  const [backendSaveResult, setBackendSaveResult] = useState<'success' | 'error' | null>(null);
  const { addNotification } = useNotifications();
  
  // Store transaction data for backend save
  const [transactionData, setTransactionData] = useState<{
    description: string;
    totalAmount: string;
  } | null>(null);

  const isLoading = isWritePending || isConfirming || isBackendLoading;

  // Reset form after successful submission
  useEffect(() => {
    if (isConfirmed && receipt && backendSaveResult === 'success') {
      setTimeout(() => {
        setDescription('');
        setMilestones([{ description: '', amount: '' }]);
        setExtractedGigId(null);
        setBackendSaveResult(null);
        setTransactionData(null);
      }, 3000);
    }
  }, [isConfirmed, receipt, backendSaveResult]);

  // Handle transaction confirmation and event detection
  useEffect(() => {
    if (isConfirmed && receipt && accountAddress && !isBackendLoading && !extractedGigId && !backendSaveResult) {
      try {
        console.log('Transaction confirmed. Receipt:', receipt);
        
        // Get the GigPosted event signature
        const gigPostedEventAbi = contractABI.find(
          (item) => item.type === 'event' && item.name === 'GigPosted'
        );

        if (!gigPostedEventAbi) {
          console.error('ABI definition for GigPosted event not found!', contractABI);
          throw new Error("ABI definition for GigPosted event not found in provided contractABI.");
        }

        console.log('Attempting to find GigPosted event in logs:', receipt.logs);
        console.log('Using ABI definition:', gigPostedEventAbi);
        console.log('Expected contract address:', contractAddress);

        // Try to extract gigId from transaction events directly
        let gigId = null;
        
        // First try: attempt to decode using viem's decodeEventLog
        try {
          for (const log of receipt.logs) {
            // Check if log is from our contract
            if (log.address.toLowerCase() === contractAddress.toLowerCase()) {
              try {
                const decoded = decodeEventLog({
                  abi: [gigPostedEventAbi],
                  data: log.data,
                  topics: log.topics,
                });
                
                if (decoded && decoded.eventName === 'GigPosted' && decoded.args.gigId) {
                  console.log('Successfully decoded GigPosted event:', decoded);
                  gigId = decoded.args.gigId.toString();
                  break;
                }
              } catch (decodeError) {
                console.log('Error decoding log, trying next one:', decodeError);
              }
            }
          }
        } catch (error) {
          console.error('Error attempting to decode logs:', error);
        }

        // Second fallback: Use transaction hash to ensure uniqueness
        if (!gigId) {
          console.log('Could not decode gigId from events, using fallback method with transaction hash');
          // Use the transaction hash to ensure uniqueness
          if (receipt.transactionHash) {
            // Use a combination of base ID and transaction hash to ensure uniqueness
            gigId = `0-${receipt.transactionHash.substring(0, 8)}`;
            console.log('Generated unique gigId using transaction hash:', gigId);
          } else {
            // Last resort fallback
            gigId = `0-${Date.now()}`;
            console.log('Generated unique gigId using timestamp:', gigId);
          }
        }

        if (gigId !== null) {
          console.log('Using gigId:', gigId);
          setExtractedGigId(gigId);
          handleBackendSave(gigId);
        } else {
          throw new Error('Could not determine the gigId for the transaction.');
        }
      } catch (error: any) {
        console.error('Error processing transaction events:', error);
        toast({
          title: "Error Processing Transaction",
          description: `Transaction confirmed on-chain, but failed to process event: ${error.message}. Your gig may still be valid on the blockchain.`,
          variant: "warning"
        });
        setBackendSaveResult('error');
      }
    }
  }, [isConfirmed, receipt, accountAddress, isBackendLoading, extractedGigId, backendSaveResult, contractABI, toast, transactionData]);

  const handleBackendSave = async (gigId: string) => {
    if (!accountAddress || !transactionData) {
      console.error("Missing required data for backend save:", { accountAddress, transactionData });
      setBackendSaveResult('error');
      return;
    }
    
    setIsBackendLoading(true);
    
    try {
      // Use the saved transaction data and ensure contractGigId is properly formatted
      const payload = {
        clientAddress: accountAddress,
        description: transactionData.description || "No description provided", // Ensure non-empty description
        budget: transactionData.totalAmount || "0", // Ensure non-empty budget
        contractGigId: gigId, // Ensure this is a string
        escrowContractAddress: contractAddress,
      };
      
      console.log('Calling backend API with payload:', payload);
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';
      
      // Ensure all values in the payload are not undefined or empty strings
      Object.keys(payload).forEach(key => {
        if (!payload[key]) {
          console.error(`Payload key "${key}" has empty value`);
        }
      });
      
      const response = await axios.post(`${apiUrl}/api/v1/gigs`, payload);
      console.log('Backend response:', response.data);

      toast({ 
        title: "Success!", 
        description: "Gig posted successfully on-chain and metadata saved!" 
      });
      
      addNotification({
        text: `You successfully posted a new gig: "${transactionData.description.substring(0, 60)}${transactionData.description.length > 60 ? '...' : ''}"`,
        type: 'gig_posted',
        read: false,
        link: '/my-contracts'
      });
      
      setBackendSaveResult('success');

    } catch (error: any) {
      console.error("Error saving gig to backend:", error);
      
      // Add more detailed error logging
      if (error.response) {
        console.error("Response error data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        toast({ 
          title: "Success with Warning", 
          description: `Gig was successfully posted on-chain. The metadata was already saved.`,
          variant: "default"
        });
        
        if (transactionData) {
          addNotification({
            text: `You successfully posted a new gig: "${transactionData.description.substring(0, 60)}${transactionData.description.length > 60 ? '...' : ''}"`,
            type: 'gig_posted',
            read: false,
            link: '/my-contracts'
          });
        }
        
        setBackendSaveResult('success');
      } else {
        const backendErrorMessage = error.response?.data?.message || error.message;
        toast({
          title: "Backend Warning",
          description: `Gig posted on-chain (Tx: ${hash ? `${hash.substring(0,6)}...` : 'confirmed'}), but metadata wasn't saved: ${backendErrorMessage}`,
          variant: "warning"
        });
        setBackendSaveResult('error');
      }
    } finally {
      console.log("Running finally block in handleBackendSave");
      setIsBackendLoading(false);
    }
  };

  const handleAddMilestone = () => {
    setMilestones([...milestones, { description: '', amount: '' }]);
  };

  const handleRemoveMilestone = (index: number) => {
    const newMs = [...milestones]; newMs.splice(index,1);
    setMilestones(newMs);
  };

  const handleMilestoneChange = (index: number, field: 'description' | 'amount', value: string) => {
    const newMs = [...milestones];
    
    if (field === 'amount') {
      // Only allow numbers and decimal points
      const validatedValue = value.replace(/[^0-9.]/g, '');
      // Prevent multiple decimal points
      const decimalCount = validatedValue.split('.').length - 1;
      if (decimalCount > 1) {
        const parts = validatedValue.split('.');
        newMs[index][field] = parts[0] + '.' + parts.slice(1).join('');
      } else {
        newMs[index][field] = validatedValue;
      }
    } else {
      newMs[index][field] = value;
    }
    
    setMilestones(newMs);
  };

  const handlePostGig = async () => {
    if (!isConnected || !accountAddress) {
      toast({ title: "Error", description: "Please connect your wallet first.", variant: "destructive" });
      return;
    }
    if (!description || milestones.length === 0) {
      toast({ title: "Error", description: "Please provide a description and at least one milestone.", variant: "destructive" });
      return;
    }

    // Validate all milestone amounts are valid numbers
    const invalidMilestone = milestones.find(m => !m.description.trim() || isNaN(parseFloat(m.amount)) || parseFloat(m.amount) <= 0);
    if (invalidMilestone) {
      toast({ 
        title: "Invalid Milestone", 
        description: "All milestones must have descriptions and valid positive ETH amounts.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      // prepare milestone arrays
      const descs = milestones.map(m => m.description);
      const valuesWei = milestones.map(m => parseEther(m.amount));
      const totalWei = valuesWei.reduce((a,b) => a + b, BigInt(0));

      // Store transaction data for backend save
      setTransactionData({
        description: description,
        totalAmount: totalWei.toString(),
      });

      setExtractedGigId(null);
      setBackendSaveResult(null);

      writeContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: 'postGig',
        args: [ZERO_ADDRESS, description, descs, valuesWei],
        value: totalWei.toString(),
      });

    } catch (error: any) {
      toast({
        title: "Transaction Error",
        description: error.message || "Could not initiate transaction.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (writeError) {
      const message = (writeError as any)?.shortMessage || writeError.message;
      toast({ title: "Contract Write Error", description: message, variant: "destructive" });
    }
  }, [writeError, toast]);

  useEffect(() => {
    if (confirmationError) {
      toast({ title: "Transaction Confirmation Error", description: confirmationError.message, variant: "destructive" });
    }
  }, [confirmationError, toast]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Post a New Gig</CardTitle>
          <CardDescription>Describe the work you need done and set your budget. Funds will be held in escrow on the blockchain.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Gig Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the task, required skills, deliverables, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label>Milestones</Label>
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center space-x-2 mb-2">
                <Input
                  placeholder="Milestone description"
                  value={m.description}
                  onChange={e => handleMilestoneChange(i,'description',e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  placeholder="Amount (ETH)"
                  value={m.amount}
                  onChange={e => handleMilestoneChange(i,'amount',e.target.value)}
                  disabled={isLoading}
                />
                {milestones.length>1 && (<XCircle className="cursor-pointer text-red-500" onClick={() => handleRemoveMilestone(i)} />)}
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={handleAddMilestone} disabled={isLoading} className="flex items-center">
              <PlusCircle className="mr-1" /> Add Milestone
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handlePostGig} disabled={!isConnected || isLoading} className="w-full">
            {isWritePending ? 'Waiting for Signature...'
             : isConfirming ? 'Confirming Transaction...'
             : isBackendLoading ? 'Saving Gig Data...'
             : backendSaveResult === 'success' ? 'Success! Gig Posted!'
             : backendSaveResult === 'error' ? 'Retry Saving Metadata'
             : 'Post Gig & Lock Funds'}
          </Button>
          {hash && <div className="text-center text-sm text-muted-foreground">
            Transaction Hash: <a 
              href={`https://sepolia.etherscan.io/tx/${hash}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:underline"
            >
              {hash.substring(0, 10)}...{hash.substring(hash.length - 8)}
            </a>
          </div>}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PostGig;
