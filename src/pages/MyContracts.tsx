import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, ArrowRight, Calendar, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { formatEther } from 'viem';
import { contractAddress, contractABI } from '@/config/contractConfig';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  value: string;
  dateCompleted?: string;
}

interface Gig {
  _id: string;
  contractGigId: string;
  clientAddress: string;
  freelancerAddress?: string;
  description: string;
  budget: string;
  status: 'Open' | 'InProgress' | 'Completed' | 'Cancelled';
  escrowContractAddress: string;
  createdAt: string;
  updatedAt: string;
  milestones?: Milestone[];
}

const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const calculateDaysLeft = (gig: Gig) => {
  const createdDate = new Date(gig.createdAt);
  const deadlineDate = new Date(createdDate);
  deadlineDate.setDate(deadlineDate.getDate() + 30);
  const daysLeft = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  return daysLeft > 0 ? daysLeft : 0;
};

const calculateProgress = (gig: Gig) => {
  if (!gig.milestones || gig.milestones.length === 0) {
    return gig.status === 'Completed' ? 100 : gig.status === 'InProgress' ? 50 : 0;
  }
  const completedCount = gig.milestones.filter(m => m.completed).length;
  return Math.round((completedCount / gig.milestones.length) * 100);
};

const MyContracts = () => {
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);
  const [clientGigs, setClientGigs] = useState<Gig[]>([]);
  const [freelancerGigs, setFreelancerGigs] = useState<Gig[]>([]);
  const [viewMode, setViewMode] = useState<'client' | 'freelancer'>('client');
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const { data: hash, error: writeError, isPending: isWritePending, writeContract } = useWriteContract();
  const [releasingPaymentGig, setReleasingPaymentGig] = useState<{ gigId: string } | null>(null);
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }
    const fetchGigs = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/gigs`);
        const myClientGigs = response.data.filter(
          (gig: Gig) => gig.clientAddress.toLowerCase() === address.toLowerCase()
        );
        const myFreelancerGigs = response.data.filter(
          (gig: Gig) => gig.freelancerAddress && 
          gig.freelancerAddress.toLowerCase() === address.toLowerCase()
        );
        const gigsWithMilestones = await addMilestonesToGigs([...myClientGigs, ...myFreelancerGigs]);
        setClientGigs(gigsWithMilestones.filter(
          (gig: Gig) => gig.clientAddress.toLowerCase() === address.toLowerCase()
        ));
        setFreelancerGigs(gigsWithMilestones.filter(
          (gig: Gig) => gig.freelancerAddress && 
          gig.freelancerAddress.toLowerCase() === address.toLowerCase()
        ));
        if (myClientGigs.length > myFreelancerGigs.length) {
          setViewMode('client');
        } else if (myFreelancerGigs.length > myClientGigs.length) {
          setViewMode('freelancer');
        }
      } catch (error: any) {
        console.error("Error fetching gigs:", error);
        toast({
          title: "Error Loading Contracts",
          description: error.response?.data?.message || error.message || "Could not fetch contract data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchGigs();
  }, [address, API_BASE_URL, toast]);

  const addMilestonesToGigs = async (gigs: Gig[]): Promise<Gig[]> => {
    return gigs.map(gig => {
      if (gig.milestones && gig.milestones.length > 0) return gig;
      const totalBudget = BigInt(gig.budget);
      if (gig.status === 'Open') {
        return {
          ...gig,
          milestones: []
        };
      } else if (gig.status === 'InProgress') {
        const milestoneBudget = totalBudget / BigInt(4);
        return {
          ...gig,
          milestones: [
            { 
              id: `${gig._id}-m1`, 
              title: "Initial Requirements", 
              completed: true, 
              value: (milestoneBudget).toString(),
              dateCompleted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            { 
              id: `${gig._id}-m2`, 
              title: "Design Phase", 
              completed: false, 
              value: (milestoneBudget).toString() 
            },
            { 
              id: `${gig._id}-m3`, 
              title: "Development", 
              completed: false, 
              value: (milestoneBudget).toString() 
            },
            { 
              id: `${gig._id}-m4`, 
              title: "Final Delivery", 
              completed: false, 
              value: (totalBudget - (milestoneBudget * BigInt(3))).toString() 
            }
          ]
        };
      } else if (gig.status === 'Completed') {
        const milestoneBudget = totalBudget / BigInt(4);
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        return {
          ...gig,
          milestones: [
            { 
              id: `${gig._id}-m1`, 
              title: "Initial Requirements", 
              completed: true, 
              value: (milestoneBudget).toString(),
              dateCompleted: new Date(now - 20 * day).toISOString()
            },
            { 
              id: `${gig._id}-m2`, 
              title: "Design Phase", 
              completed: true, 
              value: (milestoneBudget).toString(),
              dateCompleted: new Date(now - 14 * day).toISOString()  
            },
            { 
              id: `${gig._id}-m3`, 
              title: "Development", 
              completed: true, 
              value: (milestoneBudget).toString(),
              dateCompleted: new Date(now - 7 * day).toISOString()
            },
            { 
              id: `${gig._id}-m4`, 
              title: "Final Delivery", 
              completed: true, 
              value: (totalBudget - (milestoneBudget * BigInt(3))).toString(),
              dateCompleted: new Date(now - 2 * day).toISOString()
            }
          ]
        };
      } else {
        return {
          ...gig,
          milestones: []
        };
      }
    });
  };

  const sortGigs = (gigs: Gig[]) => {
    if (sortBy === 'date') {
      return [...gigs].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'value') {
      return [...gigs].sort((a, b) => 
        BigInt(b.budget) > BigInt(a.budget) ? 1 : -1
      );
    }
    return gigs;
  };

  const getActiveGigs = () => {
    const gigsToFilter = viewMode === 'client' ? clientGigs : freelancerGigs;
    return sortGigs(gigsToFilter.filter(gig => {
      if (viewMode === 'client') {
        return gig.status === 'InProgress' || gig.status === 'Open';
      } 
      else {
        return gig.status === 'InProgress';
      }
    }));
  };

  const getCompletedGigs = () => {
    const gigsToFilter = viewMode === 'client' ? clientGigs : freelancerGigs;
    return sortGigs(gigsToFilter.filter(gig => gig.status === 'Completed'));
  };
  
  const getDisputedGigs = () => {
    const gigsToFilter = viewMode === 'client' ? clientGigs : freelancerGigs;
    return sortGigs(gigsToFilter.filter(gig => gig.status === 'Cancelled'));
  };

  const handleReleaseFullPayment = (gigId: string, contractGigId: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet before releasing payment.",
        variant: "destructive"
      });
      return;
    }
    if (!contractGigId) {
        toast({
          title: "Cannot Release Payment",
          description: "Invalid contract gig ID.",
          variant: "destructive"
        });
        return;
    }
    setReleasingPaymentGig({ gigId });
    const contractArgs = {
      address: contractAddress as `0x${string}`,
      abi: contractABI,
      functionName: 'releaseFunds',
      args: [
          BigInt(contractGigId)
      ],
    };
    writeContract(contractArgs, {
      onError: (error) => {},
      onSuccess: (data) => {}
    });
  };

  const handleSubmitWork = (gigId: string) => {
    navigate('/submit-work', { state: { gigId } });
  };

  useEffect(() => {
    let loadingToastShown = false;
    if (isConfirming && releasingPaymentGig) {
      toast({
        title: "Processing Full Payment Release",
        description: `Transaction pending... Tx: ${hash?.substring(0, 10)}...`,
        variant: "default"
      });
      loadingToastShown = true;
    }
    if (isConfirmed && releasingPaymentGig) {
      toast({
        title: "Full Payment Released Successfully!",
        description: `Tx: ${hash?.substring(0, 10)}...`,
        variant: "success"
      });
      const updateGigState = (prevGigs: Gig[]) => prevGigs.map(g => {
        if (g._id === releasingPaymentGig!.gigId) {
          return {
            ...g,
            status: 'Completed',
            milestones: g.milestones?.map(m =>
              ({ ...m, completed: true, dateCompleted: new Date().toISOString() })
            ),
            updatedAt: new Date().toISOString()
          };
        }
        return g;
      });
      setClientGigs(updateGigState);
      setFreelancerGigs(updateGigState);
      addNotification({
        text: `Full payment released for gig #${releasingPaymentGig.gigId.substring(0, 6)}`,
        type: 'payment_received',
        read: false,
        link: '/my-contracts'
      });
      setReleasingPaymentGig(null);
    }
    if (writeError && releasingPaymentGig) {
      const errorDetails = (writeError as any)?.cause?.shortMessage || writeError.message;
      toast({
        title: "Payment Release Failed",
        description: errorDetails, 
        variant: "destructive"
      });
      setReleasingPaymentGig(null);
    }
  }, [isConfirming, isConfirmed, writeError, releasingPaymentGig, addNotification, toast, hash]);

  useWatchContractEvent({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    eventName: 'MilestonePaymentReleased',
    onLogs(logs) {
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 text-web3-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your contracts...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Contracts</h1>
        <div className="flex items-center gap-4">
          {clientGigs.length > 0 && freelancerGigs.length > 0 && (
            <div className="flex">
              <Button 
                variant={viewMode === 'client' ? "default" : "outline"} 
                onClick={() => setViewMode('client')}
                className="rounded-r-none"
              >
                As Client
              </Button>
              <Button 
                variant={viewMode === 'freelancer' ? "default" : "outline"} 
                onClick={() => setViewMode('freelancer')}
                className="rounded-l-none"
              >
                As Freelancer
              </Button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="value">Value</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="active" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Contracts</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="disputes">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {getActiveGigs().length > 0 ? (
            <div className="grid gap-6">
              {getActiveGigs().map(gig => (
                <ActiveContractCard 
                  key={gig._id} 
                  gig={gig} 
                  viewMode={viewMode} 
                  onReleaseFullPayment={handleReleaseFullPayment}
                  onSubmitWork={handleSubmitWork}
                  releasingPaymentGigInfo={releasingPaymentGig?.gigId === gig._id ? releasingPaymentGig : null}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Active Contracts</h3>
              <p className="text-muted-foreground max-w-md">
                {viewMode === 'client' 
                  ? "You haven't created any contracts yet. Post a gig to get started."
                  : "You haven't accepted any contracts yet. Browse available gigs to find work."}
              </p>
              <Button className="mt-6" onClick={() => window.location.href = viewMode === 'client' ? '/post-gig' : '/browse'}>
                {viewMode === 'client' ? 'Post a Gig' : 'Browse Gigs'}
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {getCompletedGigs().length > 0 ? (
            <div className="grid gap-6">
              {getCompletedGigs().map(gig => (
                <CompletedContractCard 
                  key={gig._id} 
                  gig={gig} 
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Completed Contracts</h3>
              <p className="text-muted-foreground max-w-md">
                You don't have any completed contracts yet.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="disputes">
          {getDisputedGigs().length > 0 ? (
            <div className="grid gap-6">
              {getDisputedGigs().map(gig => (
                <CancelledContractCard 
                  key={gig._id} 
                  gig={gig} 
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Cancelled Contracts</h3>
              <p className="text-muted-foreground max-w-md">
                You don't have any cancelled contracts. All of your contracts are in good standing.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ActiveContractCard = ({ 
  gig, 
  viewMode,
  onReleaseFullPayment,
  onSubmitWork,
  releasingPaymentGigInfo
}: { 
  gig: Gig; 
  viewMode: 'client' | 'freelancer';
  onReleaseFullPayment: (gigId: string, contractGigId: string) => void;
  onSubmitWork: (gigId: string) => void;
  releasingPaymentGigInfo?: { gigId: string } | null;
}) => {
  const { toast } = useToast(); 
  const daysLeft = calculateDaysLeft(gig);
  const progress = calculateProgress(gig);
  const otherPartyAddress = viewMode === 'client' ? gig.freelancerAddress : gig.clientAddress;
  const { data: milestoneHash, error: milestoneError, isLoading: isMilestonePending, writeContract: writeRelease } = useWriteContract();
  const { isLoading: isMilestoneConfirming, isSuccess: isMilestoneSuccess } = useWaitForTransactionReceipt({ hash: milestoneHash });

  useEffect(() => {
    if (isMilestonePending) {
      toast({ title: 'Releasing Milestone...', description: `Waiting for tx...`, variant: 'default' });
    }
    if (isMilestoneSuccess) {
      toast({ title: 'Milestone Paid', description: 'Funds released to freelancer.', variant: 'success' });
    }
    if (milestoneError) {
      toast({ title: 'Release Failed', description: milestoneError.message, variant: 'destructive' });
    }
  }, [isMilestonePending, isMilestoneConfirming, isMilestoneSuccess, milestoneError, toast]);

  return (
    <Card className="overflow-hidden bg-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg truncate" title={gig.description}>{gig.description}</CardTitle>
            <div className="text-sm text-muted-foreground"> 
              {viewMode === 'client' ? 'Freelancer: ' : 'Client: '}
              {otherPartyAddress ? (
                <span className="font-mono" title={otherPartyAddress}>{truncateAddress(otherPartyAddress)}</span>
              ) : (
                <Badge variant="outline">Not Assigned</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-web3-primary">
              {formatEther(BigInt(gig.budget))} ETH
            </div>
            <div className="text-xs text-muted-foreground">
              {daysLeft > 0 ? (
                <>
                  <Clock className="h-3 w-3 inline mr-1" /> {daysLeft} days left
                </>
              ) : (
                <Badge variant="outline" className="border-amber-500 text-amber-500">Due</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {gig.milestones && gig.milestones.length > 0 ? (
          <div className="space-y-3">
            {gig.milestones.map((milestone, index) => {
              const isGigPaymentLoading = releasingPaymentGigInfo?.gigId === gig._id; 
              const isLastMilestone = index === gig.milestones!.length - 1;
              return (
                <div key={milestone.id} className={`flex items-center p-3 bg-card border rounded-lg ${isGigPaymentLoading ? 'opacity-50 pointer-events-none' : ''}`}> 
                  <div className={`p-1 rounded-full ${milestone.completed ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'} mr-3`}>
                    {milestone.completed ? <CheckCircle className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{milestone.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {milestone.completed ? 
                        `Completed ${milestone.dateCompleted ? new Date(milestone.dateCompleted).toLocaleDateString() : ''}` : 
                        `Milestone ${index + 1}`}
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-3"> 
                    <div>
                      <div className="font-medium">
                        {formatEther(BigInt(milestone.value))} ETH
                      </div>
                      <Badge variant={milestone.completed ? "outline" : "secondary"} className="mt-1">
                        {milestone.completed ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                    {viewMode === 'client' && !milestone.completed && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          writeRelease({
                            address: contractAddress as `0x${string}`,
                            abi: contractABI,
                            functionName: 'releaseMilestonePayment',
                            args: [BigInt(gig.contractGigId), BigInt(index)],
                          });
                        }}
                        disabled={isMilestonePending}
                        className="ml-auto"
                      >
                        {isMilestonePending ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Releasing</>
                        ) : (
                          `Release Step ${index+1}`
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center border border-dashed rounded-lg text-muted-foreground">
            {gig.status === 'Open' 
              ? "This gig hasn't been accepted yet. No milestones are defined." 
              : "No milestone data available."}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 pb-3">
        <Button variant="outline">View Details</Button>
        {gig.status === 'InProgress' && viewMode === 'freelancer' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Submit Work <ArrowRight className="h-4 w-4 ml-1" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Work for Contract #{gig.contractGigId}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Submit your completed deliverables for the current milestone.
                  </p>
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => onSubmitWork(gig._id)}>
                      Submit Deliverables
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        )}
        {gig.status === 'Open' && viewMode === 'client' && (
          <Button variant="destructive">Cancel Gig</Button>
        )}
      </CardFooter>
    </Card>
  );
};

const CompletedContractCard = ({ gig, viewMode }: { gig: Gig; viewMode: 'client' | 'freelancer' }) => {
  const otherPartyAddress = viewMode === 'client' ? gig.freelancerAddress : gig.clientAddress;
  const rating = 5;
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg truncate" title={gig.description}>{gig.description}</CardTitle>
            <CardDescription>
              {viewMode === 'client' ? 'Freelancer: ' : 'Client: '}
              <span className="font-mono" title={otherPartyAddress}>{truncateAddress(otherPartyAddress || '')}</span>
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-500">
              {formatEther(BigInt(gig.budget))} ETH
            </div>
            <div className="text-xs text-muted-foreground">
              <FileText className="h-3 w-3 inline mr-1" /> Completed on {new Date(gig.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              Completed
            </Badge>
            <span className="text-sm text-muted-foreground ml-3">
              {viewMode === 'freelancer' ? 'Client rating: ' : 'Your rating: '}
              <span className="ml-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`${i < rating ? 'text-yellow-500' : 'text-muted'}`}>
                    ★
                  </span>
                ))}
              </span>
            </span>
          </div>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
        {gig.milestones && gig.milestones.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Completed Milestones</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {gig.milestones.map((milestone) => (
                <div key={milestone.id} className="border rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">{milestone.title}</div>
                  <div className="font-medium">{formatEther(BigInt(milestone.value))} ETH</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CancelledContractCard = ({ gig, viewMode }: { gig: Gig; viewMode: 'client' | 'freelancer' }) => {
  const otherPartyAddress = viewMode === 'client' ? gig.freelancerAddress : gig.clientAddress;
  return (
    <Card className="bg-card border-border/50 border-red-300/30">
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg truncate" title={gig.description}>{gig.description}</CardTitle>
            <CardDescription>
              {viewMode === 'client' ? 'Freelancer: ' : 'Client: '}
              <span className="font-mono" title={otherPartyAddress}>{truncateAddress(otherPartyAddress || '')}</span>
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-red-500">
              {formatEther(BigInt(gig.budget))} ETH
            </div>
            <div className="text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3 inline mr-1" /> Cancelled on {new Date(gig.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
            Cancelled
          </Badge>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyContracts;
