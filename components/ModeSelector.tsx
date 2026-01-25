import React from 'react';
import { SystemMode } from '../types';

interface ModeSelectorProps {
  currentMode: SystemMode;
  onSwitchMode: (mode: SystemMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onSwitchMode }) => {
  const modes = [
    { id: SystemMode.THINK, label: 'THINK', desc: 'Analysis & Model', color: 'border-mode-think text-mode-think hover:bg-mode-think/10' },
    { id: SystemMode.BUILD, label: 'BUILD', desc: 'Code & Create', color: 'border-mode-build text-mode-build hover:bg-mode-build/10' },
    { id: SystemMode.MAINTAIN, label: 'MAINTAIN', desc: 'Clean & Repair', color: 'border-mode-maintain text-mode-maintain hover:bg-mode-maintain/10' },
    { id: SystemMode.HUMAN, label: 'HUMAN', desc: 'Rest & Connect', color: 'border-mode-human text-mode-human hover:bg-mode-human/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onSwitchMode(m.id)}
          className={`
            p-4 border-2 rounded-lg text-left transition-all duration-200 font-mono
            ${currentMode === m.id ? `bg-fmi-panel ${m.color} ring-1 ring-offset-0` : 'border-fmi-border text-gray-500 hover:border-gray-500'}
          `}
        >
          <div className="font-bold text-lg">{m.label}</div>
          <div className="text-xs opacity-70">{m.desc}</div>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;