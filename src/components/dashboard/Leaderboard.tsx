import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import axios from 'axios';
import { Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Freelancer {
  username: string;
  walletAddress: string;
  completedGigs: number;
  totalEarned: string;
}

export const Leaderboard: React.FC = () => {
  const { token } = useAuth();
  const [leaders, setLeaders] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        const res = await axios.get(`${apiUrl}/api/v1/analytics/leaderboard`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        if (res.data.success) {
          setLeaders(res.data.data);
        } else {
          setError('Failed to load leaderboard');
        }
      } catch (err: any) {
        console.error('Error fetching leaderboard:', err);
        setError('Error fetching leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, [token]);

  return (
    <Card className="bg-card mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 text-yellow-400" />
          Top Freelancers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ul className="space-y-4">
            {leaders.map((f, idx) => (
              <li key={f.walletAddress} className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">#{idx + 1} {f.username}</span>
                  <div className="text-xs text-muted-foreground">{f.walletAddress}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Gigs: {f.completedGigs}</div>
                  <div className="text-sm">Earned: {parseFloat(f.totalEarned) / 1e18} ETH</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};