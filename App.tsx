import React, { useState } from 'react';
import { SystemMode, SystemState, Artifact, BufferItem } from './types';
import KernelStatus from './components/KernelStatus';
import ModeSelector from './components/ModeSelector';
import ArtifactFeed from './components/ArtifactFeed';
import BufferZone from './components/BufferZone';
import MetricsViz from './components/MetricsViz';
import VideoLogger from './components/VideoLogger';

type ViewTab = 'OPS' | 'LOGS' | 'BUFFER';

// --- CURATED LOG OF FAILED IDEAS (Kernel Rejections) ---
// These serve as the "Checklist" of what NOT to do.
const FAILED_IDEAS_LOG: BufferItem[] = [
  {
    id: 'rejected_01',
    source: 'INTERNAL_MONOLOGUE',
    domain: 'COGNITION',
    content: "IDEA: Rewrite the entire OS in Rust to optimize for nanosecond latency.\n\nRESULT: Rejected. Speculative optimization. No 'Definition of Done'. Classic procrastination wrapper.",
    status: 'REJECTED',
    timestamp: Date.now() - 1000000
  },
  {
    id: 'rejected_02',
    source: 'SOCIAL_FEED',
    domain: 'FINANCE',
    content: "IDEA: Pivot strategy based on new crypto macro-cycle theory.\n\nRESULT: Rejected. Financial layer constraints (S01) forbid speculation. Violation of 'Boring' rule.",
    status: 'REJECTED',
    timestamp: Date.now() - 800000
  },
  {
    id: 'rejected_03',
    source: 'IDENTITY_DRIFT',
    domain: 'BODY',
    content: "IDEA: Adopt new 'Bio-Hacker' identity and buy $500 of supplements.\n\nRESULT: Rejected. Identity is fluff. Protocol requires 'Biological Maintenance' (Sleep/Eat/Move), not aesthetic purchases.",
    status: 'REJECTED',
    timestamp: Date.now() - 600000
  },
  {
    id: 'rejected_04',
    source: 'ANXIETY_LOOP',
    domain: 'TIME',
    content: "IDEA: Re-plan the 5-year roadmap because I feel behind.\n\nRESULT: Rejected. Planning without execution is a loop. Generate one artifact first.",
    status: 'REJECTED',
    timestamp: Date.now() - 400000
  }
];

const App: React.FC = () => {
  // --- State Initialization ---
  const [systemState, setSystemState] = useState<SystemState>({
    currentMode: SystemMode.THINK,
    modeStartTime: Date.now(),
    lastArtifactTime: Date.now(),
    isStalled: false,
  });

  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  // Initialize Buffer with the Failed Ideas Log so user sees them immediately
  const [bufferItems, setBufferItems] = useState<BufferItem[]>([...FAILED_IDEAS_LOG]);
  
  // UI States
  const [showVideoLogger, setShowVideoLogger] = useState(false);
  const [activeScript, setActiveScript] = useState('');
  const [activeTab, setActiveTab] = useState<ViewTab>('OPS');

  // --- Handlers ---
  const handleSwitchMode = (newMode: SystemMode) => {
    if (newMode === systemState.currentMode) return;
    
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
      mode: systemState.currentMode
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

  // clear entire buffer (used for manual resets or after export)
  const handleClearBuffer = () => {
    setBufferItems([]);
  };

  const handleUpdateBufferItem = (updatedItem: BufferItem) => {
    setBufferItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const openVideoLogger = (scriptContext: string = '') => {
    setActiveScript(scriptContext);
    setShowVideoLogger(true);
  };

  const handleCommitVideo = (filename: string, blob: Blob | null) => {
    const description = blob 
      ? `Video Log size: ${Math.round(blob.size / 1024)}KB. Uploaded to YouTube.` 
      : `BROADCAST SESSION (LIVE). Artifact is external (YouTube).`;

    handleAddArtifact({
      title: filename,
      description: description,
      type: 'VIDEO',
      isExternal: true,
      mode: SystemMode.BUILD
    });
    setShowVideoLogger(false);
  };

  return (
    <div className="min-h-screen bg-fmi-bg text-gray-200 font-sans flex flex-col">
      
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-fmi-bg/95 backdrop-blur border-b border-fmi-border px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-mono font-bold tracking-tight text-white">FMI <span className="text-gray-500">KERNEL</span></h1>
          </div>
          <div className="h-6 w-px bg-fmi-border mx-2 hidden md:block"></div>
          {/* Tab Switcher */}
          <div className="flex bg-fmi-panel rounded-lg p-1 border border-fmi-border">
            {(['OPS', 'LOGS', 'BUFFER'] as ViewTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-1 rounded text-xs font-mono font-bold transition-all
                  ${activeTab === tab 
                    ? 'bg-gray-700 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col text-right">
               <span className="text-[10px] font-mono text-gray-500">STATUS</span>
               <div className="flex items-center gap-2 justify-end">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-xs font-mono text-green-500">ONLINE</span>
               </div>
             </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-4 md:p-8 flex-1">
        
        {/* VIEW: OPS (Command Center) */}
        {activeTab === 'OPS' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
            {/* Status Monitor */}
            <section>
              <KernelStatus state={systemState} />
            </section>

            {/* Mode Control */}
            <section>
              <div className="flex justify-between items-end mb-4 border-b border-fmi-border pb-2">
                <h3 className="text-sm font-mono text-gray-400">MODE SELECTION</h3>
                <span className="text-[10px] font-mono text-gray-600">ONE MODE ACTIVE</span>
              </div>
              <ModeSelector 
                currentMode={systemState.currentMode} 
                onSwitchMode={handleSwitchMode} 
              />
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button 
                  onClick={() => openVideoLogger('')}
                  className="bg-fmi-panel border-2 border-fmi-border hover:border-white text-white font-mono p-6 rounded-lg flex items-center justify-between group transition-all"
               >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold">VIDEO LOG</div>
                      <div className="text-xs text-gray-500">Record Artifact / Broadcast</div>
                    </div>
                  </div>
                  <span className="text-gray-500 group-hover:text-white">→</span>
               </button>

               <button 
                  onClick={() => setActiveTab('BUFFER')}
                  className="bg-fmi-panel border-2 border-fmi-border hover:border-white text-white font-mono p-6 rounded-lg flex items-center justify-between group transition-all"
               >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <div className="w-4 h-0.5 bg-blue-400"></div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold">INPUT BUFFER</div>
                      <div className="text-xs text-gray-500">Staging Area ({bufferItems.length})</div>
                    </div>
                  </div>
                  <span className="text-gray-500 group-hover:text-white">→</span>
               </button>
            </section>
          </div>
        )}

        {/* VIEW: LOGS (Artifacts & History) */}
        {activeTab === 'LOGS' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12">
               <MetricsViz artifacts={artifacts} />
            </div>
            <div className="lg:col-span-12">
               <ArtifactFeed artifacts={artifacts} onAddArtifact={handleAddArtifact} />
            </div>
          </div>
        )}

        {/* VIEW: BUFFER (Staging Area) */}
        {activeTab === 'BUFFER' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <BufferZone 
                items={bufferItems} 
                onAddItem={handleAddBufferItem} 
                onUpdateItem={handleUpdateBufferItem}
                onClear={() => handleClearBuffer()}
              />
            </div>
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-fmi-panel p-6 border border-fmi-border rounded text-sm font-mono text-gray-400">
                 <strong className="text-white block mb-4 border-b border-gray-700 pb-2">FOUNDATION PROTOCOL</strong>
                 <ul className="space-y-2 list-disc pl-4">
                   <li><strong className="text-gray-300">Singular Focus:</strong> One mode active at a time.</li>
                   <li><strong className="text-gray-300">Artifact Gate:</strong> No new idea without an artifact.</li>
                   <li><strong className="text-gray-300">Definition of Done:</strong> Observable, External, Boring.</li>
                   <li><strong className="text-gray-300">Buffer Rule:</strong> Distill before you build.</li>
                 </ul>
               </div>
               
               <div className="bg-fmi-panel p-6 border border-fmi-border rounded text-sm font-mono text-gray-400">
                  <strong className="text-white block mb-2">DOMAIN MAP</strong>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-800 p-2 rounded">TIME</div>
                    <div className="bg-gray-800 p-2 rounded">BODY</div>
                    <div className="bg-gray-800 p-2 rounded">COGNITION</div>
                    <div className="bg-gray-800 p-2 rounded">FINANCE</div>
                    <div className="bg-gray-800 p-2 rounded">WORK</div>
                    <div className="bg-gray-800 p-2 rounded">FAMILY</div>
                  </div>
               </div>
            </div>
          </div>
        )}

      </div>

      {/* Overlays */}
      {showVideoLogger && (
        <VideoLogger 
          onCommitArtifact={handleCommitVideo}
          initialScript={activeScript}
          onClose={() => setShowVideoLogger(false)}
        />
      )}
    </div>
  );
};

export default App;