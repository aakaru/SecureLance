import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const backendUrl = 'http://localhost:5002'; 

const Profile = () => {
  const { user: authUser, token, setUser } = useAuth();
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableUser, setEditableUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${backendUrl}/api/v1/profile/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to fetch profile: ${response.status} ${response.statusText}`, errorText);
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
        const data = await response.json();
        setUserState(data);
        setEditableUser(data);
        setImagePreview(data.photoUrl ? backendUrl + data.photoUrl : null);
      } catch (err) {
        console.error('Error in fetchProfile:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableUser({ ...editableUser, [name]: value });
  };
  const handleSkillsChange = (e) => {
    setEditableUser({ ...editableUser, skills: e.target.value.split(',').map(skill => skill.trim()) });
  };
  const handlePortfolioChange = (index, field, value) => {
    const newPortfolio = [...editableUser.portfolio];
    newPortfolio[index][field] = value;
    setEditableUser({ ...editableUser, portfolio: newPortfolio });
  };
  const addPortfolioItem = () => {
    setEditableUser({
      ...editableUser,
      portfolio: [...(editableUser.portfolio || []), { title: '', description: '', url: '' }],
    });
  };
  const removePortfolioItem = (index) => {
    setEditableUser({
      ...editableUser,
      portfolio: editableUser.portfolio.filter((_, i) => i !== index),
    });
  };
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await fetch(`${backendUrl}/api/v1/profile/me/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!response.ok) throw new Error('Failed to upload image');
      const data = await response.json();
      const newPhotoUrl = backendUrl + data.photoUrl + '?t=' + Date.now();
      setEditableUser({ ...editableUser, photoUrl: data.photoUrl });
      setImagePreview(newPhotoUrl);
      toast({ title: 'Profile image updated!' });
    } catch (err) {
      toast({ title: 'Image upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${backendUrl}/api/v1/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editableUser),
      });
      if (!response.ok) throw new Error('Failed to save profile');
      const updatedData = await response.json();
      setUser(updatedData); 
      setUserState(updatedData);
      setIsEditing(false);
      toast({ title: 'Profile updated!', description: 'Your profile information has been saved.' });
    } catch (err) {
      setError(err);
      toast({ title: 'Error saving profile', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 text-red-500">
        Error loading profile: {error.message}
      </div>
    );
  }
  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 text-muted-foreground">
        Profile not found.
      </div>
    );
  }
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {}
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-web3-primary shadow-lg">
              <AvatarImage src={imagePreview || (editableUser?.photoUrl ? backendUrl + editableUser.photoUrl : '/placeholder.svg')} alt={editableUser?.username} />
              <AvatarFallback>{editableUser?.username ? editableUser.username.split(' ').map(n => n[0]).join('') : '?'}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute bottom-2 right-2 z-10"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={uploading}
                />
              </>
            )}
          </div>
          <div className="text-center md:text-left">
            {isEditing ? (
              <Input
                name="username"
                placeholder="Username"
                value={editableUser?.username || ''}
                onChange={handleInputChange}
                className="text-3xl font-bold text-center md:text-left"
              />
            ) : (
              <h1 className="text-3xl font-bold">{user.username}</h1>
            )}
            <p className="text-muted-foreground">{user.title || 'Web3 Freelancer'}</p>
          </div>
        </div>
        {}
        <div className="flex-1 w-full">
          {}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  name="aboutMe"
                  placeholder="Tell us about yourself..."
                  value={editableUser?.aboutMe || ''}
                  onChange={handleInputChange}
                  rows={5}
                />
              ) : (
                <p>{user.aboutMe || 'No information provided.'}</p>
              )}
            </CardContent>
          </Card>
          {}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {isEditing ? (
                <Input
                  name="skills"
                  placeholder="Comma-separated skills (e.g., React, Node.js)"
                  value={editableUser?.skills?.join(', ') || ''}
                  onChange={handleSkillsChange}
                />
              ) : user.skills && user.skills.length > 0 ? (
                user.skills.map(skill => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No skills listed.</p>
              )}
            </CardContent>
          </Card>
          {}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>Some of my recent projects.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {isEditing ? (
                  <>
                    {editableUser?.portfolio?.map((project, index) => (
                      <div key={index} className="border p-4 rounded-md">
                        <Input
                          placeholder="Project Title"
                          value={project.title}
                          onChange={(e) => handlePortfolioChange(index, 'title', e.target.value)}
                          className="mb-2"
                        />
                        <Textarea
                          placeholder="Project Description"
                          value={project.description}
                          onChange={(e) => handlePortfolioChange(index, 'description', e.target.value)}
                          rows={2}
                          className="mb-2"
                        />
                        <Input
                          placeholder="Project URL"
                          value={project.url}
                          onChange={(e) => handlePortfolioChange(index, 'url', e.target.value)}
                          className="mb-2"
                        />
                        <Button variant="destructive" size="sm" onClick={() => removePortfolioItem(index)}>Remove</Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addPortfolioItem}>Add Portfolio Item</Button>
                  </>
                ) : user.portfolio && user.portfolio.length > 0 ? (
                  user.portfolio.map((project, index) => (
                    <React.Fragment key={project.title + index}>
                      <div>
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <p className="text-muted-foreground text-sm">{project.description}</p>
                        {project.url && (
                          <a href={project.url} className="text-primary hover:underline text-sm" target="_blank" rel="noopener noreferrer">View Project</a>
                        )}
                      </div>
                      {index < user.portfolio.length - 1 && <Separator />}
                    </React.Fragment>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No portfolio items added.</p>
                )}
              </div>
            </CardContent>
          </Card>
          {}
          <div className="mt-6 text-center md:text-left">
            {isEditing ? (
              <Button onClick={handleSave} disabled={saving} className="glow-btn">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="glow-btn">Edit Profile</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
