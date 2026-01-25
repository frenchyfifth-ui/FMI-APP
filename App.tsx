import React, { useState, useEffect } from 'react';
import { SystemMode, SystemState, Artifact, BufferItem } from './types';
import KernelStatus from './components/KernelStatus';
import ModeSelector from './components/ModeSelector';
import ArtifactFeed from './components/ArtifactFeed';
import BufferZone from './components/BufferZone';
import MetricsViz from './components/MetricsViz';

const App: React.FC = () => {
  // --- State Initialization ---
  const [systemState, setSystemState] = useState<SystemState>({
    currentMode: SystemMode.THINK,
    modeStartTime: Date.now(),
    lastArtifactTime: Date.now(),
    isStalled: false,
  });

  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [bufferItems, setBufferItems] = useState<BufferItem[]>([]);

  // --- Handlers ---
  const handleSwitchMode = (newMode: SystemMode) => {
    if (newMode === systemState.currentMode) return;
    
    // In a real app, we might force an artifact here before switching if strictly enforcing constraints
    setSystemState(prev => ({
      ...prev,
      currentMode: newMode,
      modeStartTime: Date.now()
    }));
  };

  const handleAddArtifact = (newArtifactData: Omit<Artifact, 'id' | 'timestamp'>) => {
    const artifact: Artifact = {
      ...newArtifactData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      mode: systemState.currentMode // Force the artifact to tag with CURRENT mode
    };

    setArtifacts(prev => [...prev, artifact]);
    
    // Reset Watchdog
    setSystemState(prev => ({
      ...prev,
      lastArtifactTime: Date.now(),
      isStalled: false
    }));
  };

  const handleAddBufferItem = (item: BufferItem) => {
    setBufferItems(prev => [item, ...prev]);
  };

  const handleUpdateBufferItem = (updatedItem: BufferItem) => {
    setBufferItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  return (
    <div className="min-h-screen bg-fmi-bg text-gray-200 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-fmi-border pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-mono font-bold tracking-tight text-white">FMI <span className="text-gray-500">EXECUTION KERNEL</span></h1>
            <p className="text-xs font-mono text-gray-500 mt-1">Foundation V1.0 // Constraint-First Runtime</p>
          </div>
          <div className="text-right mt-4 md:mt-0">
             <div className="text-[10px] font-mono text-gray-500">SYSTEM STATUS</div>
             <div className="flex items-center gap-2 justify-end">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-sm font-mono text-green-500">OPERATIONAL</span>
             </div>
          </div>
        </header>

        {/* Kernel Monitor */}
        <KernelStatus state={systemState} />

        {/* Controls */}
        <ModeSelector 
          currentMode={systemState.currentMode} 
          onSwitchMode={handleSwitchMode} 
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Col: Artifacts & Metrics (Execution) */}
          <div className="lg:col-span-7 space-y-6">
            <ArtifactFeed artifacts={artifacts} onAddArtifact={handleAddArtifact} />
            <MetricsViz artifacts={artifacts} />
          </div>

          {/* Right Col: Buffer (Staging) */}
          <div className="lg:col-span-5 space-y-6">
             <div className="bg-fmi-panel p-4 border border-fmi-border rounded text-xs font-mono text-gray-400">
               <strong className="text-white block mb-1">FOUNDATION PROTOCOL:</strong>
               1. ONE MODE ACTIVE AT A TIME.<br/>
               2. NO NEW IDEA WITHOUT ARTIFACT.<br/>
               3. DONE = OBSERVABLE, EXTERNAL, BORING.
             </div>
             <BufferZone 
                items={bufferItems} 
                onAddItem={handleAddBufferItem} 
                onUpdateItem={handleUpdateBufferItem}
              />
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;