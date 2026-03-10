import React, { useState } from 'react';
import { BufferItem } from '../types';
import { distillBufferItem } from '../services/geminiService';
import { commitToBuffer, downloadLocally } from '../services/githubService';

interface BufferZoneProps {
  items: BufferItem[];
  onAddItem: (item: BufferItem) => void;
  onUpdateItem: (item: BufferItem) => void;
  onClear: () => void;
}

const BufferZone: React.FC<BufferZoneProps> = ({ items, onAddItem, onUpdateItem }) => {
  const [inputContent, setInputContent] = useState('');
  const [domain, setDomain] = useState<BufferItem['domain']>('TIME');
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewFilter, setViewFilter] = useState<'ACTIVE' | 'REJECTED'>('ACTIVE');

  const handleIngest = async () => {
    if (!inputContent.trim()) return;
    
    setIsProcessing(true);
    const newItem: BufferItem = {
      id: Math.random().toString(36).substr(2, 9),
      content: inputContent,
      source: 'MANUAL_INPUT',
      domain,
      status: 'PENDING',
      timestamp: Date.now()
    };
    
    // 1. Commit to GitHub (or Mock)
    const synced = await commitToBuffer(newItem);
    
    // 2. Update Local State
    onAddItem(newItem); // Add locally regardless of sync status
    if (!synced) {
        // Optional: Auto-download if sync fails?
        // For now, we rely on the manual button to avoid popup blocking
    }
    
    setInputContent('');
    setIsProcessing(false);
  };

  const handleDistill = async (item: BufferItem) => {
    setIsProcessing(true);
    // Simulate API delay or actual call
    const distilledContent = await distillBufferItem(item);
    onUpdateItem({
      ...item,
      status: 'DISTILLED',
      content: `${item.content}\n\n--- AI DISTILLATION ---\n${distilledContent}`
    });
    setIsProcessing(false);
  };

  const handleDownload = (item: BufferItem) => {
    const date = new Date(item.timestamp).toISOString().split('T')[0];
    const filename = `BUFFER_${item.domain}_${date}.md`;
    const content = `# BUFFER INPUT: ${item.domain}\n\n**Status:** ${item.status}\n\n${item.content}`;
    downloadLocally(filename, content);
  };

  const filteredItems = items.filter(i => 
    viewFilter === 'ACTIVE' 
      ? i.status !== 'REJECTED' 
      : i.status === 'REJECTED'
  );

  return (
    <div className="bg-fmi-panel border border-fmi-border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4 border-b border-fmi-border pb-2">
        <h3 className="text-lg font-mono font-bold text-white">
          BUFFER_INPUTS [{viewFilter}]
        </h3>
        <div className="flex gap-2">
           <button 
             onClick={() => setViewFilter('ACTIVE')}
             className={`text-[10px] px-2 py-1 rounded font-mono ${viewFilter === 'ACTIVE' ? 'bg-blue-900 text-blue-200' : 'text-gray-500'}`}
           >
             ACTIVE STREAM
           </button>
           <button 
             onClick={() => setViewFilter('REJECTED')}
             className={`text-[10px] px-2 py-1 rounded font-mono ${viewFilter === 'REJECTED' ? 'bg-red-900 text-red-200' : 'text-gray-500'}`}
           >
             KERNEL REJECTIONS
           </button>
           {viewFilter === 'ACTIVE' && items.length > 0 && (
             <button
               onClick={onClear}
               className="text-[10px] px-2 py-1 rounded font-mono bg-gray-700 text-gray-300 hover:bg-gray-600"
               title="Empty the buffer"
             >
               CLEAR
             </button>
           )}
        </div>
      </div>

      {/* Input Area (Only visible in Active view) */}
      {viewFilter === 'ACTIVE' && (
        <div className="mb-6 animate-in fade-in">
          <textarea
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            disabled={isProcessing}
            className="w-full h-24 bg-fmi-bg border border-fmi-border text-gray-300 p-2 font-mono text-xs resize-none focus:border-white outline-none mb-2 disabled:opacity-50"
            placeholder="Paste raw thoughts, expert findings, or links here..."
          />
          <div className="flex gap-2">
            <select 
              value={domain}
              onChange={(e) => setDomain(e.target.value as any)}
              className="bg-fmi-bg border border-fmi-border text-gray-300 text-xs font-mono px-2 outline-none flex-1"
            >
              <option value="TIME">TIME</option>
              <option value="BODY">BODY</option>
              <option value="COGNITION">COGNITION</option>
              <option value="FINANCE">FINANCE</option>
              <option value="WORK">WORK</option>
              <option value="FAMILY">FAMILY</option>
            </select>
            <button 
              onClick={handleIngest}
              disabled={isProcessing}
              className="bg-gray-700 text-white font-mono text-xs px-4 py-2 hover:bg-gray-600 disabled:opacity-50"
            >
              {isProcessing ? 'SYNCING...' : 'INGEST & SYNC'}
            </button>
          </div>
        </div>
      )}

      {/* List Area */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredItems.map(item => (
          <div key={item.id} className={`p-3 rounded border border-fmi-border ${item.status === 'REJECTED' ? 'bg-red-900/10' : 'bg-fmi-bg'}`}>
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono text-blue-400">{item.domain}</span>
                <div className="flex gap-2 items-center">
                    <span className={`text-[10px] font-mono px-1 rounded ${
                    item.status === 'PENDING' ? 'bg-yellow-900 text-yellow-500' : 
                    item.status === 'REJECTED' ? 'bg-red-950 text-red-500' :
                    'bg-green-900 text-green-500'
                    }`}>
                    {item.status}
                    </span>
                    <button 
                        onClick={() => handleDownload(item)}
                        className="text-[10px] font-mono text-gray-400 hover:text-white"
                        title="Download to Disk"
                    >
                        ⬇
                    </button>
                </div>
             </div>
             <p className="text-xs text-gray-400 font-mono mb-2 whitespace-pre-wrap">{item.content}</p>
             
             {item.status === 'PENDING' && (
               <button 
                 onClick={() => handleDistill(item)}
                 disabled={isProcessing}
                 className="w-full border border-gray-700 text-gray-400 text-[10px] py-1 hover:bg-gray-800 font-mono transition-colors"
               >
                 {isProcessing ? 'DISTILLING...' : 'RUN AI DISTILLATION'}
               </button>
             )}
             
             {item.status === 'REJECTED' && (
                <div className="text-[10px] font-mono text-red-400 mt-2 pt-2 border-t border-red-900/30">
                   REASON: VIOLATED EXECUTION KERNEL. NO ARTIFACT DEFINITION.
                </div>
             )}
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="text-center text-xs text-gray-600 font-mono py-8">
            {viewFilter === 'ACTIVE' ? 'BUFFER CLEAR. INPUTS SYNCED.' : 'NO REJECTIONS LOGGED.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default BufferZone;