'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface ContestTimerProps {
  startTime: string | Date;
  endTime: string | Date;
  status?: 'upcoming' | 'ongoing' | 'completed';
}

export const ContestTimer: React.FC<ContestTimerProps> = ({ startTime, endTime, status }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [timerStatus, setTimerStatus] = useState<'upcoming' | 'ongoing' | 'completed'>(status || 'upcoming');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();

      if (now < start) {
        // Contest hasn't started
        setTimerStatus('upcoming');
        const diff = start - now;
        setTimeRemaining(formatTime(diff, 'Starts in'));
      } else if (now >= start && now < end) {
        // Contest is ongoing
        setTimerStatus('ongoing');
        const diff = end - now;
        setTimeRemaining(formatTime(diff, 'Ends in'));
      } else {
        // Contest ended
        setTimerStatus('completed');
        setTimeRemaining('Contest Ended');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  const formatTime = (milliseconds: number, prefix: string): string => {
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${prefix}: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${prefix}: ${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${prefix}: ${minutes}m ${seconds}s`;
    } else {
      return `${prefix}: ${seconds}s`;
    }
  };

  const getTimerColor = () => {
    if (timerStatus === 'completed') return 'text-gray-400';
    if (timerStatus === 'ongoing') return 'text-green-400';
    return 'text-blue-400';
  };

  const getTimerIcon = () => {
    if (timerStatus === 'completed') return <Calendar className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  if (timerStatus === 'completed' && status === 'completed') {
    return null; // Don't show timer for completed contests
  }

  return (
    <div className={`flex items-center gap-2 font-mono text-lg font-semibold ${getTimerColor()}`}>
      {getTimerIcon()}
      <span>{timeRemaining}</span>
    </div>
  );
};
