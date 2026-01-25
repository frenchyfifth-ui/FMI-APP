import React, { useState } from 'react';
import { BufferItem } from '../types';
import { distillBufferItem } from '../services/geminiService';

interface BufferZoneProps {
  items: BufferItem[];
  onAddItem: (item: BufferItem) => void;
  onUpdateItem: (item: BufferItem) => void;
}

const BufferZone: React.FC<BufferZoneProps> = ({ items, onAddItem, onUpdateItem }) => {
  const [inputContent, setInputContent] = useState('');
  const [domain, setDomain] = useState<BufferItem['domain']>('TIME');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleIngest = () => {
    if (!inputContent.trim()) return;
    
    const newItem: BufferItem = {
      id: Math.random().toString(36).substr(2, 9),
      content: inputContent,
      source: 'MANUAL_INPUT',
      domain,
      status: 'PENDING',
      timestamp: Date.now()
    };
    
    onAddItem(newItem);
    setInputContent('');
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

  return (
    <div className="bg-fmi-panel border border-fmi-border rounded-lg p-6">
      <h3 className="text-lg font-mono font-bold text-white mb-4 border-b border-fmi-border pb-2">
        BUFFER_INPUTS [STAGING]
      </h3>

      <div className="mb-6">
        <textarea
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          className="w-full h-24 bg-fmi-bg border border-fmi-border text-gray-300 p-2 font-mono text-xs resize-none focus:border-white outline-none mb-2"
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
            className="bg-gray-700 text-white font-mono text-xs px-4 py-2 hover:bg-gray-600"
          >
            INGEST
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {items.filter(i => i.status !== 'PROMOTED').map(item => (
          <div key={item.id} className="bg-fmi-bg p-3 rounded border border-fmi-border">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono text-blue-400">{item.domain}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${item.status === 'PENDING' ? 'bg-yellow-900 text-yellow-500' : 'bg-green-900 text-green-500'}`}>
                  {item.status}
                </span>
             </div>
             <p className="text-xs text-gray-400 font-mono truncate mb-2">{item.content.split('\n')[0]}</p>
             
             {item.status === 'PENDING' && (
               <button 
                 onClick={() => handleDistill(item)}
                 disabled={isProcessing}
                 className="w-full border border-gray-700 text-gray-400 text-[10px] py-1 hover:bg-gray-800 font-mono"
               >
                 {isProcessing ? 'DISTILLING...' : 'RUN AI DISTILLATION'}
               </button>
             )}
          </div>
        ))}
        {items.length === 0 && <div className="text-center text-xs text-gray-600 font-mono">BUFFER CLEAR.</div>}
      </div>
    </div>
  );
};

export default BufferZone;