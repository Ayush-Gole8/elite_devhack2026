'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { problemAPI, submissionAPI } from '@/lib/api';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Dynamically import Monaco Editor (client-side only)
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function ProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise (Next.js 15+ requirement)
  const { id } = use(params);
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('// Write your solution here\n');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<any>(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchProblem();
    }
  }, [user, authLoading, id]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await problemAPI.getProblem(id);
      const problemData = response.data || response; // Handle both response formats
      setProblem(problemData);
      
      // Set default starter code
      setCode(`// ${problemData.title}\n// Difficulty: ${problemData.difficulty}\n\n// Write your solution here\n`);
    } catch (error) {
      console.error('Error fetching problem:', error);
      toast.error('Failed to load problem');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before submitting');
      return;
    }

    try {
      setSubmitting(true);
      const response = await submissionAPI.submitSolution(id, code, language);
      const submissionData = response.data || response; // Handle both response formats
      setSubmission(submissionData);
      toast.success('Submission received! Evaluating...');
      
      // Start polling for results
      startPolling(submissionData._id);
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const startPolling = (submissionId: string) => {
    setPolling(true);
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await submissionAPI.getSubmission(submissionId);
        const submissionData = response.data || response; // Handle both response formats
        setSubmission(submissionData);
        
        if (submissionData.status !== 'Pending') {
          clearInterval(pollInterval);
          setPolling(false);
          
          if (submissionData.status === 'Accepted') {
            toast.success('✅ Accepted! All test cases passed!');
          } else if (submissionData.status === 'Wrong Answer') {
            toast.error('❌ Wrong Answer');
          } else if (submissionData.status === 'Runtime Error') {
            toast.error('⚠️ Runtime Error');
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollInterval);
        setPolling(false);
      }
    }, 1500); // Poll every 1.5 seconds

    // Stop polling after 30 seconds
    setTimeout(() => {
      clearInterval(pollInterval);
      setPolling(false);
    }, 30000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'hard':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-500';
      case 'Wrong Answer':
        return 'bg-red-500';
      case 'Runtime Error':
        return 'bg-orange-500';
      case 'Pending':
        return 'bg-blue-500 animate-pulse';
      default:
        return 'bg-gray-500';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl">Problem not found</p>
          <Button className="mt-4" onClick={() => router.push('/problems')}>
            Back to Problems
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/problems')}
                className="hover:bg-muted/80"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">{problem.title}</h1>
                  <Badge className={`${getDifficultyColor(problem.difficulty)} mt-1`}>
                    {problem.difficulty}
                  </Badge>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="hover:bg-muted/80"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-73px)]">
        {/* Left: Problem Description */}
        <div className="border-r border-border/50 overflow-y-auto bg-background/50 backdrop-blur-sm">
          <div className="p-8">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="description" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  Description
                </TabsTrigger>
                <TabsTrigger value="submissions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Submissions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-6 mt-0">
                {/* Problem Info */}
                <Card className="border-2 shadow-lg bg-gradient-to-br from-card to-card/80">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <span className="inline-block w-2 h-8 bg-primary rounded-full"></span>
                      {problem.title}
                    </CardTitle>
                    <CardDescription className="mt-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        <Badge className={`${getDifficultyColor(problem.difficulty)} text-sm py-1 px-3`}>
                          {problem.difficulty}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">
                            {problem.totalSubmissions > 0
                              ? `${Math.round((problem.acceptedSubmissions / problem.totalSubmissions) * 100)}% Accepted`
                              : 'No submissions yet'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 flex-wrap">
                        {problem.tags?.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs bg-muted/50 hover:bg-muted">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Description */}
                <Card className="shadow-md border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Problem Statement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/30 p-4 rounded-lg">{problem.description}</pre>
                    </div>
                  </CardContent>
                </Card>

                {/* Sample Test Cases */}
                {problem.sample && (
                  <Card className="shadow-md border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Sample Test Case
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Input:</h4>
                        <pre className="bg-muted/50 p-4 rounded-lg text-sm font-mono border border-border/50">{problem.sample.input}</pre>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Output:</h4>
                        <pre className="bg-muted/50 p-4 rounded-lg text-sm font-mono border border-border/50">{problem.sample.output}</pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Constraints */}
                {problem.constraints && (
                  <Card className="shadow-md border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Constraints
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/30 p-4 rounded-lg font-mono">{problem.constraints}</pre>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="submissions">
                <Card className="shadow-md">
                  <CardContent className="py-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-muted-foreground">Submission history will appear here</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right: Code Editor */}
        <div className="flex flex-col bg-muted/5">
          {/* Editor Controls */}
          <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg border border-border/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <select
                  className="bg-transparent border-none outline-none text-sm font-medium cursor-pointer"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
              <Badge variant="outline" className="text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Time Limit: 1s
              </Badge>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitting || polling}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-md text-white font-semibold px-6"
              size="default"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : polling ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Evaluating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                  Submit Code
                </>
              )}
            </Button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative border-b border-border/50">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              language={language}
              value={code}
              onChange={(value: string | undefined) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                fontFamily: 'Fira Code, Consolas, Monaco, monospace',
                fontLigatures: true,
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                renderLineHighlight: 'all',
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          {/* Submission Result */}
          {submission && (
            <div className="border-t p-6 space-y-4 bg-background/80 backdrop-blur-sm max-h-[40vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Submission Result
                </h3>
                <Badge className={`${getStatusColor(submission.status)} text-white px-3 py-1 text-sm font-semibold`}>
                  {submission.status}
                </Badge>
              </div>
              
              {submission.status !== 'Pending' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                      <div className="text-sm text-muted-foreground mb-1">Test Cases</div>
                      <div className="text-2xl font-bold flex items-center gap-2">
                        {submission.testCasesPassed} / {submission.totalTestCases}
                        {submission.testCasesPassed === submission.totalTestCases ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    {submission.executionTime && (
                      <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                        <div className="text-sm text-muted-foreground mb-1">Execution Time</div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                          {submission.executionTime}ms
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {submission.error && (
                    <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-red-500 mb-1">Error</p>
                          <p className="text-sm text-red-400 font-mono">{submission.error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {submission.testResults && submission.testResults.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        Test Results
                      </p>
                      {submission.testResults.map((result: any, idx: number) => (
                        <div
                          key={idx}
                          className={`rounded-lg p-4 border-2 ${
                            result.passed 
                              ? 'bg-green-500/10 border-green-500/30' 
                              : 'bg-red-500/10 border-red-500/30'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-sm">Test Case {idx + 1}</span>
                            <span className="text-lg">
                              {result.passed ? '✅' : '❌'}
                            </span>
                          </div>
                          {!result.passed && (
                            <div className="font-mono text-xs space-y-2 mt-3 bg-background/50 p-3 rounded border border-border/30">
                              <div className="flex gap-2">
                                <span className="text-muted-foreground font-semibold min-w-[70px]">Input:</span>
                                <span className="text-foreground">{result.input}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground font-semibold min-w-[70px]">Expected:</span>
                                <span className="text-green-400">{result.expected}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground font-semibold min-w-[70px]">Got:</span>
                                <span className="text-red-400">{result.actual}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
