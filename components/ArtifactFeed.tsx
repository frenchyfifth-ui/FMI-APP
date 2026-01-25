import React, { useState } from 'react';
import { Artifact, SystemMode } from '../types';

interface ArtifactFeedProps {
  artifacts: Artifact[];
  onAddArtifact: (artifact: Omit<Artifact, 'id' | 'timestamp'>) => void;
}

const ArtifactFeed: React.FC<ArtifactFeedProps> = ({ artifacts, onAddArtifact }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<Artifact['type']>('DOC');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddArtifact({
      title,
      description: desc,
      mode: SystemMode.BUILD, // Default, logic usually handled by parent based on current mode
      type,
      isExternal: true
    });
    setTitle('');
    setDesc('');
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
            className="w-full bg-fmi-panel border border-fmi-border text-white px-3 py-2 font-mono text-sm focus:border-white outline-none"
            placeholder="e.g. EXECUTION_KERNEL.md"
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
          className="w-full bg-white text-black font-mono font-bold text-sm py-2 hover:bg-gray-200 transition-colors"
        >
          COMMIT ARTIFACT (DONE)
        </button>
        <p className="text-[10px] text-gray-600 font-mono mt-2 text-center">
          * Must be observable, external, and boring.
        </p>
      </form>

      {/* List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {artifacts.length === 0 && (
          <div className="text-gray-600 text-sm font-mono text-center py-4">NO ARTIFACTS SHIPPED. SYSTEM STALLED?</div>
        )}
        {[...artifacts].reverse().map((art) => (
          <div key={art.id} className="border-l-2 border-gray-600 pl-3 py-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono text-gray-400">
                {new Date(art.timestamp).toLocaleTimeString()}
              </span>
              <span className="text-[10px] font-mono border border-gray-700 px-1 rounded text-gray-400">
                {art.type}
              </span>
            </div>
            <h4 className="text-sm font-bold text-gray-200">{art.title}</h4>
            <div className="flex gap-2 mt-1">
              <span className={`text-[10px] font-mono px-1 rounded ${
                art.mode === SystemMode.BUILD ? 'bg-mode-build/20 text-mode-build' :
                art.mode === SystemMode.THINK ? 'bg-mode-think/20 text-mode-think' :
                'bg-gray-700 text-gray-300'
              }`}>
                {art.mode}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtifactFeed;