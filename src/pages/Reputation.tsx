import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star as LucideStar, Award, MessageSquare, Clock, CheckCheck, Wallet, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

const trustScoreData = [
  { month: 'Jan', score: 78 },
  { month: 'Feb', score: 82 },
  { month: 'Mar', score: 85 },
  { month: 'Apr', score: 89 },
  { month: 'May', score: 93 },
  { month: 'Jun', score: 87 },
  { month: 'Jul', score: 92 },
  { month: 'Aug', score: 95 },
  { month: 'Sep', score: 96 },
  { month: 'Oct', score: 97 },
];
const badges = [
  {
    id: 1,
    name: 'On-Time Master',
    description: 'Always delivers work on schedule',
    icon: Clock,
    color: 'bg-web3-blue/20 text-web3-blue border-web3-blue/30'
  },
  {
    id: 2,
    name: 'Quality Craftsman',
    description: 'Consistently high-quality deliverables',
    icon: CheckCheck,
    color: 'bg-green-500/20 text-green-500 border-green-500/30'
  },
  {
    id: 3,
    name: 'Communication Pro',
    description: 'Outstanding client communication',
    icon: MessageSquare,
    color: 'bg-web3-primary/20 text-web3-primary border-web3-primary/30'
  },
  {
    id: 4,
    name: 'Top Earner',
    description: 'Among top 10% of platform earners',
    icon: Wallet,
    color: 'bg-amber-500/20 text-amber-500 border-amber-500/30'
  },
];
const feedback = [
  {
    id: 1,
    client: '0x1a2b...3c4d',
    project: 'DeFi Dashboard',
    rating: 5,
    comment: 'Exceptional work! The dashboard exceeded our expectations with its intuitive design and seamless Web3 integration.',
    date: '2025-04-15'
  },
  {
    id: 2,
    client: '0x5e6f...7g8h',
    project: 'NFT Marketplace',
    rating: 5,
    comment: 'Amazing attention to detail. Really understood our vision and delivered a polished product.',
    date: '2025-03-28'
  },
  {
    id: 3,
    client: '0x9i0j...1k2l',
    project: 'Smart Contract Audit',
    rating: 4,
    comment: 'Thorough review that identified several critical issues. Very professional work.',
    date: '2025-03-10'
  },
];
export const Reputation = () => {
  const { address, isConnected } = useAccount();
  const { token } = useAuth();
  const [completedGigs, setCompletedGigs] = useState<number | null>(null);
  const [totalEarned, setTotalEarned] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address || !token) {
      setCompletedGigs(null);
      setTotalEarned(null);
      setError(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/profile/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setCompletedGigs(data.completedGigs || 0);
        setTotalEarned(ethers.formatEther(data.totalEarned || '0'));
        setError(null);
      } catch (e: any) {
        console.error('Error fetching reputation:', e);
        setError('Failed to fetch reputation data.');
        setCompletedGigs(null);
        setTotalEarned(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isConnected, address, token]);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">My Reputation Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <TrustScoreCard 
          completedGigs={completedGigs}
          totalEarned={totalEarned}
          isLoading={isLoading}
          error={error}
          isConnected={isConnected}
        />
        <div className="col-span-3">
          <TrustScoreChart data={trustScoreData} /> 
        </div>
      </div>
      <Tabs defaultValue="badges" className="mb-8">
        <TabsList>
          <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
          <TabsTrigger value="ratings">Client Feedback</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
        </TabsList>
        <TabsContent value="badges" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="ratings" className="mt-6">
          <div className="space-y-6">
            {feedback.map((item) => (
              <FeedbackCard key={item.id} feedback={item} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="metrics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard 
              title="On-Time Delivery" 
              value={98} 
              description="Projects delivered by the agreed deadline" 
            />
            <MetricCard 
              title="Quality Score" 
              value={96} 
              description="Based on client ratings and minimal revisions" 
            />
            <MetricCard 
              title="Communication" 
              value={94} 
              description="Responsiveness and clarity in client interactions" 
            />
            <MetricCard 
              title="Dispute Resolution" 
              value={100} 
              description="Successfully resolved without escalation" 
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const TrustScoreCard = ({ completedGigs, totalEarned, isLoading, error, isConnected }: {
  completedGigs: number | null;
  totalEarned: string | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}) => {
  return (
    <Card className="glow-border bg-card animate-pulse-glow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">My Reputation</CardTitle>
        <CardDescription>Based on completed gigs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center min-h-[100px]">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-web3-primary" />
          ) : error ? (
            <p className="text-red-500 text-sm text-center">{error}</p>
          ) : !isConnected ? (
            <p className="text-muted-foreground text-sm text-center">Connect wallet to view reputation</p>
          ) : (completedGigs !== null && totalEarned !== null) ? (
            <>
              <div className="text-center mb-2">
                <div className="text-3xl font-bold text-web3-primary">{completedGigs}</div>
                <div className="text-xs text-muted-foreground">Gigs Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-web3-primary">{totalEarned} ETH</div>
                <div className="text-xs text-muted-foreground">Total Earned</div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm text-center">No reputation data found for this address.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const RatingStar = ({ filled }: { filled: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? "#9b87f5" : "none"}
    stroke={filled ? "#9b87f5" : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const TrustScoreChart = ({ data }: { data: any[] }) => {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Trust Score Evolution</CardTitle>
        <CardDescription>Last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" tick={{ fill: '#8E9196' }} />
              <YAxis domain={[70, 100]} tick={{ fill: '#8E9196' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1F2C', 
                  borderColor: '#333',
                  color: '#fff'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#9b87f5" 
                fillOpacity={1}
                fill="url(#colorScore)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
const BadgeCard = ({ badge }: { badge: any }) => {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{badge.name}</CardTitle>
          <div className={`p-2 rounded-full ${badge.color.split(' ')[0]} border ${badge.color.split(' ')[2]}`}>
            <badge.icon className={`h-5 w-5 ${badge.color.split(' ')[1]}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{badge.description}</p>
      </CardContent>
    </Card>
  );
};
const FeedbackCard = ({ feedback }: { feedback: any }) => {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-base">{feedback.project}</CardTitle>
            <CardDescription>Client: {feedback.client}</CardDescription>
          </div>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <RatingStar key={i} filled={i < feedback.rating} />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">"{feedback.comment}"</p>
        <p className="text-xs text-muted-foreground">{feedback.date}</p>
      </CardContent>
    </Card>
  );
};
const MetricCard = ({ title, value, description }: { title: string, value: number, description: string }) => {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">{value}%</span>
          </div>
          <Progress value={value} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
export default Reputation;
