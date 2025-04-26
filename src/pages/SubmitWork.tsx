import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FileUp, Clock, CheckCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const SubmitWork = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContract, setSelectedContract] = useState('');
  const [milestone, setMilestone] = useState('');
  const [notes, setNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

  useEffect(() => {
    if (!user || !user.walletAddress || !user._id) { 
      setContracts([]); 
      return;
    }
    axios.get(`${API_BASE_URL}/api/v1/gigs?freelancerAddress=${user.walletAddress}&status=InProgress`)
      .then(res => {
        setContracts(res.data);
      })
      .catch(() => {
        toast.error('Failed to load active contracts.');
        setContracts([]);
      });
    axios.get(`${API_BASE_URL}/api/v1/submissions?user=${user._id}`)
      .then(res => {
        setSubmissions(res.data);
      })
      .catch(() => {
        setSubmissions([]);
      });
  }, [user, API_BASE_URL]);

  useEffect(() => {
    if (
      location.state && location.state.gigId &&
      contracts.length > 0 &&
      !selectedContract
    ) {
      const gig = contracts.find((c: any) => c._id === location.state.gigId || c.contractGigId === location.state.gigId);
      if (gig) {
        setSelectedContract(gig.contractGigId);
        setMilestone(gig.milestones?.find((m: any) => !m.completed)?.title || '');
      }
    }
  }, [location.state, contracts, selectedContract]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };
  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) {
      toast.error('Please select a contract');
      return;
    }
    if (files.length === 0) {
      toast.error('Please attach at least one file');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('contractGigId', selectedContract);
    formData.append('milestone', milestone);
    formData.append('notes', notes);
    formData.append('user', user._id); 
    formData.append('timeSpent', timeSpent);
    formData.append('file', files[0]);
    try {
      await axios.post(`${API_BASE_URL}/api/v1/submissions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Work submitted successfully!');
      setSelectedContract('');
      setMilestone('');
      setNotes('');
      setTimeSpent('');
      setFiles([]);
      const res = await axios.get(`${API_BASE_URL}/api/v1/submissions?user=${user._id}`);
      setSubmissions(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Submit Work</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Work Submission</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Contract & Milestone</label>
                  <Select
                    value={selectedContract}
                    onValueChange={val => {
                      setSelectedContract(val);
                      const contract = contracts.find(c => c.contractGigId === val);
                      setMilestone(contract?.milestones?.find((m: any) => !m.completed)?.title || '');
                    }}
                    disabled={contracts.length === 0}
                  >
                    <SelectTrigger className="web3-input">
                      <SelectValue placeholder="Choose a contract" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Active Contracts</SelectLabel>
                        {contracts.map(contract => (
                          <SelectItem key={contract.contractGigId} value={contract.contractGigId}>
                            {contract.description} - {contract.milestones?.find((m: any) => !m.completed)?.title || 'No Milestone'}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {contracts.length === 0 && (
                    <div className="text-muted-foreground text-xs mt-2">No active contracts available.</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Files (IPFS-based storage)</label>
                  <div className="border-2 border-dashed border-border rounded-md p-8 text-center">
                    <input 
                      type="file" 
                      id="file-upload" 
                      className="hidden" 
                      multiple 
                      onChange={handleFileChange} 
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="space-y-3">
                        <div className="flex justify-center">
                          <FileUp className="h-12 w-12 text-web3-primary" />
                        </div>
                        <p className="text-lg font-medium">
                          Drag & drop files here or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          All files will be securely stored on IPFS
                        </p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="mt-4 border-web3-primary text-web3-primary hover:bg-web3-primary/10"
                        >
                          Select Files
                        </Button>
                      </div>
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h4 className="text-sm font-medium">Selected Files</h4>
                      {files.map((file, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center p-3 bg-muted/30 rounded-md"
                        >
                          <div className="flex items-center space-x-2">
                            <FileUp className="h-5 w-5 text-web3-primary" />
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <span>✕</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-2">Notes</label>
                  <Textarea 
                    id="notes" 
                    className="web3-input"
                    placeholder="Add any details about this submission..."
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="time-spent" className="block text-sm font-medium mb-2">Time Spent</label>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-web3-primary" />
                    <input
                      type="text"
                      id="time-spent"
                      className="web3-input"
                      placeholder="e.g. 4.5 hours"
                      value={timeSpent}
                      onChange={(e) => setTimeSpent(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="glow-btn w-full rounded-md mt-6"
                  disabled={loading}
                >
                  <CheckCheck className="h-5 w-5 mr-2" />
                  {loading ? 'Submitting...' : 'Submit Work'}
                </Button>
                <div className="text-xs text-muted-foreground text-center mt-4">
                  By submitting, you confirm this work is original and meets the contract requirements.
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="bg-card mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Submission Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ensure your work meets all requirements specified in the contract milestone before submitting.
              </p>
              <div>
                <h4 className="text-sm font-medium">Best Practices:</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                  <li>Include all source files in your submission</li>
                  <li>Document any special instructions or notes</li>
                  <li>Test thoroughly before submitting</li>
                  <li>Be responsive to feedback</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissions.length === 0 ? (
                  <div className="text-muted-foreground text-center">None</div>
                ) : (
                  submissions.map((submission, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 border border-border rounded-md flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-sm">{submission.milestone || submission.contractGigId}</p>
                        <p className="text-xs text-muted-foreground">{new Date(submission.createdAt).toLocaleDateString()}</p>
                        <a href={submission.ipfsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline">View File</a>
                      </div>
                      <div>
                        <Badge className="bg-web3-primary/20 text-web3-primary border border-web3-primary/30">
                          Submitted
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default SubmitWork;
