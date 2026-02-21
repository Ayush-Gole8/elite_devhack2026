'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { contestAPI, problemAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Save, 
  Plus,
  X,
  Calendar,
  Clock,
  Trophy,
  FileText,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface Problem {
  _id: string;
  title: string;
  difficulty: string;
}

export default function CreateContestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: 120, // in minutes
    isPublic: true,
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await problemAPI.getProblems();
      setProblems(response.data || response);
    } catch (error) {
      console.error('Error fetching problems:', error);
      toast.error('Failed to load problems');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    });
  };

  const toggleProblem = (problemId: string) => {
    if (selectedProblems.includes(problemId)) {
      setSelectedProblems(selectedProblems.filter(id => id !== problemId));
    } else {
      setSelectedProblems([...selectedProblems, problemId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error('Please select start and end times');
      return;
    }

    if (selectedProblems.length === 0) {
      toast.error('Please select at least one problem');
      return;
    }

    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);

    if (endDate <= startDate) {
      toast.error('End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      const contestData = {
        title: formData.title,
        description: formData.description,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        duration: formData.duration,
        problems: selectedProblems,
        isPublic: formData.isPublic,
        status: startDate > new Date() ? 'upcoming' : 'ongoing',
      };

      const response = await contestAPI.createContest(contestData);
      
      toast.success('Contest created successfully!');
      router.push('/contests');
    } catch (error: any) {
      console.error('Error creating contest:', error);
      toast.error(error.response?.data?.message || 'Failed to create contest');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You must be logged in to create contests</p>
          <Button onClick={() => router.push('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-2">
                Create New Contest
                <Sparkles className="h-8 w-8 text-yellow-500" />
              </h1>
              <p className="text-muted-foreground mt-1">Set up a competitive coding challenge</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Basic Information
              </CardTitle>
              <CardDescription>Core details about your contest</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Contest Title <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Weekly Coding Challenge #1"
                  className="h-12"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what this contest is about, difficulty level, and what participants can expect..."
                  className="w-full min-h-30 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                Schedule & Duration
              </CardTitle>
              <CardDescription>When will this contest take place?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Start Time <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="h-12"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-500" />
                    End Time <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="h-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Duration (minutes) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="120"
                  min="30"
                  max="600"
                  className="h-12"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 120-240 minutes for standard contests
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Problem Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-500" />
                Select Problems
              </CardTitle>
              <CardDescription>
                Choose {selectedProblems.length} problem{selectedProblems.length !== 1 ? 's' : ''} for this contest
              </CardDescription>
            </CardHeader>
            <CardContent>
              {problems.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading problems...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                  {problems.map((problem) => (
                    <div
                      key={problem._id}
                      onClick={() => toggleProblem(problem._id)}
                      className={`
                        p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${selectedProblems.includes(problem._id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">{problem.title}</p>
                          <span className={`
                            text-xs px-2 py-0.5 rounded-full font-medium
                            ${problem.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-600' : ''}
                            ${problem.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-600' : ''}
                            ${problem.difficulty === 'hard' ? 'bg-rose-500/20 text-rose-600' : ''}
                          `}>
                            {problem.difficulty}
                          </span>
                        </div>
                        {selectedProblems.includes(problem._id) && (
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4 justify-end sticky bottom-4 bg-background/95 backdrop-blur-sm border rounded-lg p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-linear-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Contest
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
