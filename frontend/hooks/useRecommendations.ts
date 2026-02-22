import { useState, useEffect } from 'react';
import { recommendationAPI } from '@/lib/api';

export interface WeakTopic {
  tag: string;
  total: number;
  accepted: number;
  successRate: number;
}

export interface PatternGap {
  tag: string;
  freq: number;
}

export interface RecommendedProblem {
  _id: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

export interface RecommendationData {
  solvedCount: number;
  milestone: number | null;
  weakTopics: WeakTopic[];
  patternGaps: PatternGap[];
  efficiencyNudge: boolean;
  recommendedProblems: RecommendedProblem[];
}

const useRecommendations = (userId: string | undefined) => {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await recommendationAPI.getRecommendations(userId);
        if (res.success) {
          setData(res.data);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load recommendations';
        setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || msg);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  return { data, loading, error };
};

export default useRecommendations;
