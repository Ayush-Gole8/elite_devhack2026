'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/20">
      {/* Navigation Bar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Elite DevHack</h1>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user.profilePhoto && (
                  <img
                    src={user.profilePhoto}
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="text-sm">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'Coder'}! 👋
          </h2>
          <p className="text-muted-foreground">
            Ready to tackle some coding challenges?
          </p>
        </div>

        {/* Onboarding Status */}
        {!user.isOnboarded && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <CardHeader>
              <CardTitle className="text-lg">Complete Your Profile</CardTitle>
              <CardDescription>
                Finish setting up your profile to unlock all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/onboarding')}>
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Problems</CardTitle>
              <CardDescription>Solve coding challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">150+</div>
              <p className="text-sm text-muted-foreground">
                Available problems
              </p>
              <Button className="w-full mt-4" variant="outline">
                Browse Problems
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contests</CardTitle>
              <CardDescription>Compete with others</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">5</div>
              <p className="text-sm text-muted-foreground">
                Active contests
              </p>
              <Button className="w-full mt-4" variant="outline">
                View Contests
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>See where you rank</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">-</div>
              <p className="text-sm text-muted-foreground">
                Your rank
              </p>
              <Button className="w-full mt-4" variant="outline">
                View Leaderboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Your Stats</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Problems Solved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Submissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Contests Joined</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">1200</div>
                <p className="text-xs text-muted-foreground">Rating</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest submissions and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
                <p className="text-sm mt-2">Start solving problems to see your activity here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
