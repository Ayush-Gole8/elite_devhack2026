'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { userAPI } from '@/lib/api';

export default function OnboardingPage() {
  const { user, loading: authLoading, refreshUserData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    portfolio: '',
    github: '',
    linkedin: '',
    twitter: '',
    skills: '',
    experience: '',
    education: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }

    try {
      setLoading(true);
      
      // User ID from auth context
      const userId = user._id || user.id;
      
      // Parse skills from comma-separated string
      const skillsArray = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      const updateData = {
        username: formData.username,
        social: {
          portfolio: formData.portfolio,
          github: formData.github,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
        },
        skills: skillsArray,
        experience: formData.experience,
        education: formData.education,
        isOnboarded: true,
      };

      await userAPI.updateProfile(userId, updateData);
      
      // Update local storage
      localStorage.setItem('isOnboarded', 'true');
      
      // Refresh user data
      await refreshUserData();
      
      toast.success('Profile completed successfully!');
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.response?.data?.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle redirects in useEffect to avoid React rendering error
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!authLoading && user?.isOnboarded) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect happening, show loading
  if (user.isOnboarded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-linear-to-br from-background to-muted/20">
      <div className="max-w-2xl mx-auto py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Tell us about yourself to get started with Elite DevHack
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Links</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio Website</Label>
                  <Input
                    id="portfolio"
                    name="portfolio"
                    placeholder="https://yourportfolio.com"
                    value={formData.portfolio}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    name="github"
                    placeholder="https://github.com/username"
                    value={formData.github}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedin}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    placeholder="https://twitter.com/username"
                    value={formData.twitter}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  name="skills"
                  placeholder="JavaScript, Python, React, Node.js (comma-separated)"
                  value={formData.skills}
                  onChange={handleChange}
                />
                <p className="text-sm text-muted-foreground">
                  Separate skills with commas
                </p>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Textarea
                  id="experience"
                  name="experience"
                  placeholder="Tell us about your coding experience..."
                  value={formData.experience}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              {/* Education */}
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Textarea
                  id="education"
                  name="education"
                  placeholder="Your educational background..."
                  value={formData.education}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Complete Profile'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Skip for Now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
