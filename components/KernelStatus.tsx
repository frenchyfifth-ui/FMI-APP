import React, { useEffect, useState } from 'react';
import { SystemMode, SystemState } from '../types';

interface KernelStatusProps {
  state: SystemState;
}

const KernelStatus: React.FC<KernelStatusProps> = ({ state }) => {
  const [elapsed, setElapsed] = useState<string>("00:00:00");
  const [watchdogProgress, setWatchdogProgress] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = now - state.modeStartTime;
      
      // Format elapsed time
      const hrs = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const secs = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
      setElapsed(`${hrs}:${mins}:${secs}`);

      // Watchdog logic (72 hours max stall)
      const hoursSinceArtifact = (now - state.lastArtifactTime) / (1000 * 60 * 60);
      const progress = Math.min((hoursSinceArtifact / 72) * 100, 100);
      setWatchdogProgress(progress);

    }, 1000);

    return () => clearInterval(timer);
  }, [state.modeStartTime, state.lastArtifactTime]);

  const getModeColor = (mode: SystemMode) => {
    switch (mode) {
      case SystemMode.THINK: return 'text-mode-think border-mode-think';
      case SystemMode.BUILD: return 'text-mode-build border-mode-build';
      case SystemMode.MAINTAIN: return 'text-mode-maintain border-mode-maintain';
      case SystemMode.HUMAN: return 'text-mode-human border-mode-human';
      default: return 'text-white border-white';
    }
  };

  const getModeGlow = (mode: SystemMode) => {
    switch (mode) {
      case SystemMode.THINK: return 'shadow-[0_0_20px_rgba(59,130,246,0.3)]';
      case SystemMode.BUILD: return 'shadow-[0_0_20px_rgba(16,185,129,0.3)]';
      case SystemMode.MAINTAIN: return 'shadow-[0_0_20px_rgba(245,158,11,0.3)]';
      case SystemMode.HUMAN: return 'shadow-[0_0_20px_rgba(139,92,246,0.3)]';
      default: return '';
    }
  };

  return (
    <div className="w-full mb-8">
      <div className={`relative bg-fmi-panel border-l-4 p-6 rounded-r-lg ${getModeColor(state.currentMode).split(' ')[1]} ${getModeGlow(state.currentMode)} transition-all duration-500`}>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Active Kernel Mode</h2>
            <h1 className={`text-4xl font-black font-mono tracking-tighter ${getModeColor(state.currentMode).split(' ')[0]}`}>
              {state.currentMode}
            </h1>
          </div>
          <div className="text-right">
             <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Runtime</h2>
             <div className="text-2xl font-mono text-white">{elapsed}</div>
          </div>
        </div>

        {/* Watchdog Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className={watchdogProgress > 80 ? "text-red-500 font-bold" : "text-gray-500"}>
              WATCHDOG STATUS {watchdogProgress > 80 ? "[CRITICAL]" : "[NORMAL]"}
            </span>
            <span className="text-gray-500">72H LIMIT</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${watchdogProgress > 80 ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}
              style={{ width: `${watchdogProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KernelStatus;