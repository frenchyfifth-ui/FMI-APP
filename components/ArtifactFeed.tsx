import React, { useState } from 'react';
import { Artifact, SystemMode } from '../types';
import { commitJourneyLog, downloadLocally } from '../services/githubService';

interface ArtifactFeedProps {
  artifacts: Artifact[];
  onAddArtifact: (artifact: Omit<Artifact, 'id' | 'timestamp'>) => void;
}

const ArtifactFeed: React.FC<ArtifactFeedProps> = ({ artifacts, onAddArtifact }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<Artifact['type']>('DOC');
  const [isCommitting, setIsCommitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsCommitting(true);

    const newArtifactData = {
      title,
      description: desc,
      mode: SystemMode.BUILD, // In real app, pass current mode
      type,
      isExternal: true
    };

    // Attempt GitHub commit
    // We create a temp object just for the API call signature
    const tempArtifact: Artifact = {
      ...newArtifactData,
      id: "pending",
      timestamp: Date.now(),
      mode: SystemMode.BUILD
    };

    const synced = await commitJourneyLog(tempArtifact);
    
    // Always add to local feed, but mark if it was synced or not
    onAddArtifact({
      ...newArtifactData,
      isExternal: synced
    });
    
    setTitle('');
    setDesc('');
    setIsCommitting(false);
  };

  const handleDownload = (art: Artifact) => {
    const date = new Date(art.timestamp).toISOString().split('T')[0];
    const filename = `${date}_${art.title.replace(/\s+/g, '_')}.md`;
    const content = `# JOURNEY LOG: ${art.title}\n\n**Date:** ${date}\n**Description:** ${art.description}\n**Type:** ${art.type}`;
    downloadLocally(filename, content);
  };

  return (
    <div className="bg-fmi-panel border border-fmi-border rounded-lg p-6">
      <h3 className="text-lg font-mono font-bold text-white mb-4 border-b border-fmi-border pb-2">
        JOURNEY_LOGS [ARTIFACTS]
      </h3>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-6 bg-fmi-bg p-4 rounded border border-fmi-border">
        <div className="mb-3">
          <label className="block text-xs font-mono text-gray-500 mb-1">ARTIFACT TITLE</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isCommitting}
            className="w-full bg-fmi-panel border border-fmi-border text-white px-3 py-2 font-mono text-sm focus:border-white outline-none disabled:opacity-50"
            placeholder="e.g. EXECUTION_KERNEL.md"
          />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-mono text-gray-500 mb-1">DESCRIPTION / CONTEXT</label>
          <textarea 
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            disabled={isCommitting}
            className="w-full bg-fmi-panel border border-fmi-border text-white px-3 py-2 font-mono text-xs focus:border-white outline-none h-16 resize-none disabled:opacity-50"
            placeholder="Why was this built? What problem does it solve?"
          />
        </div>
        <div className="flex gap-2 mb-3">
          <select 
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="bg-fmi-panel border border-fmi-border text-gray-300 text-xs font-mono px-2 py-1 outline-none"
          >
            <option value="DOC">DOCUMENTATION</option>
            <option value="CODE">CODE / REPO</option>
            <option value="DECISION">DECISION LOG</option>
            <option value="PHYSICAL">PHYSICAL OBJECT</option>
          </select>
        </div>
        <button 
          type="submit"
          disabled={isCommitting}
          className="w-full bg-white text-black font-mono font-bold text-sm py-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCommitting ? 'SYNCING...' : 'COMMIT LOG ENTRY'}
        </button>
      </form>

      {/* List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {artifacts.length === 0 && (
          <div className="text-gray-600 text-sm font-mono text-center py-4">NO ARTIFACTS SHIPPED. SYSTEM STALLED?</div>
        )}
        {[...artifacts].reverse().map((art) => (
          <div key={art.id} className="border-l-2 border-gray-600 pl-3 py-1 group hover:border-white transition-colors relative">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono text-gray-400">
                {new Date(art.timestamp).toLocaleTimeString()}
              </span>
              <div className="flex gap-2 items-center">
                <span className="text-[10px] font-mono border border-gray-700 px-1 rounded text-gray-400">
                  {art.type}
                </span>
                <button 
                  onClick={() => handleDownload(art)}
                  className="text-[10px] font-mono bg-gray-800 hover:bg-white hover:text-black px-2 rounded text-gray-400 transition-colors"
                  title="Download Markdown to Disk"
                >
                  ⬇ SAVE
                </button>
              </div>
            </div>
            <h4 className="text-sm font-bold text-gray-200">{art.title}</h4>
            <div className="text-[10px] text-gray-500 mb-1 truncate">{art.description}</div>
            <div className="flex gap-2 mt-1">
              <span className={`text-[10px] font-mono px-1 rounded ${
                art.mode === SystemMode.BUILD ? 'bg-mode-build/20 text-mode-build' :
                art.mode === SystemMode.THINK ? 'bg-mode-think/20 text-mode-think' :
                'bg-gray-700 text-gray-300'
              }`}>
                {art.mode}
              </span>
              <span className={`text-[10px] font-mono ${art.isExternal ? 'text-green-500' : 'text-gray-500'}`}>
                 {art.isExternal ? '● SYNCED' : '○ LOCAL'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtifactFeed;