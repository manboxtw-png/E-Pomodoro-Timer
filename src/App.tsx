/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import type { Mode, ModeConfig } from './types';

const MODES: Record<Mode, ModeConfig> = {
  focus: { label: '專注', minutes: 25 },
  shortBreak: { label: '短休息', minutes: 5 },
  longBreak: { label: '長休息', minutes: 15 },
};

export default function App() {
  const [mode, setMode] = useState<Mode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(() => {
    const saved = localStorage.getItem('pomodoroCount');
    return saved ? parseInt(saved, 10) : 0;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    document.title = `(${formatTime(timeLeft)}) ${MODES[mode].label}中 - Pomodoro Timer`;
  }, [timeLeft, mode]);

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft === 0) {
      if (mode === 'focus') {
        const newCount = completedCount + 1;
        setCompletedCount(newCount);
        localStorage.setItem('pomodoroCount', newCount.toString());
      }
      
      // Auto-switch mode
      if (mode === 'focus') setMode('shortBreak');
      else if (mode === 'shortBreak') setMode('focus');
      else setMode('focus');
      setIsRunning(false);
      setTimeLeft(mode === 'focus' ? MODES.shortBreak.minutes * 60 : MODES.focus.minutes * 60);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode, completedCount]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].minutes * 60);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm w-full text-center">
        <h1 className="text-2xl font-sans font-medium text-gray-800 mb-8">蕃茄鐘</h1>
        
        <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-full">
          {Object.entries(MODES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => switchMode(key as Mode)}
              className={`flex-1 py-2 rounded-full text-sm transition-colors ${mode === key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {config.label}
            </button>
          ))}
        </div>

        <div className="text-8xl font-mono font-medium text-gray-900 mb-8 tracking-tighter">
          {formatTime(timeLeft)}
        </div>

        <div className="flex justify-center gap-4">
          <button 
            onClick={() => setIsRunning(true)}
            disabled={isRunning}
            className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            開始
          </button>
          <button 
            onClick={() => setIsRunning(false)}
            disabled={!isRunning}
            className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            暫停
          </button>
          <button 
            onClick={() => { setTimeLeft(MODES[mode].minutes * 60); setIsRunning(false); }}
            className="px-8 py-3 bg-gray-100 text-gray-900 rounded-full font-medium hover:bg-gray-200 transition-colors"
          >
            重設
          </button>
        </div>
        
        <div className="mt-8 text-gray-500 text-sm">
          今日完成: {completedCount} 個蕃茄鐘
        </div>
      </div>
    </div>
  );
}
