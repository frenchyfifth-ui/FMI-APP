import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';
import { Artifact, SystemMode } from '../types';

interface MetricsVizProps {
  artifacts: Artifact[];
}

const MetricsViz: React.FC<MetricsVizProps> = ({ artifacts }) => {
  // Aggregate artifacts by Mode
  const data = [
    { name: 'THINK', count: artifacts.filter(a => a.mode === SystemMode.THINK).length, color: '#3b82f6' },
    { name: 'BUILD', count: artifacts.filter(a => a.mode === SystemMode.BUILD).length, color: '#10b981' },
    { name: 'MAINTAIN', count: artifacts.filter(a => a.mode === SystemMode.MAINTAIN).length, color: '#f59e0b' },
    { name: 'HUMAN', count: artifacts.filter(a => a.mode === SystemMode.HUMAN).length, color: '#8b5cf6' },
  ];

  return (
    <div className="h-64 bg-fmi-panel border border-fmi-border rounded-lg p-4">
       <h3 className="text-xs font-mono font-bold text-gray-500 mb-4 uppercase tracking-widest">
        Artifact Throughput by Mode
      </h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#181b21', borderColor: '#2d333b', color: '#fff' }}
            itemStyle={{ fontFamily: 'monospace', fontSize: 12 }}
            cursor={{fill: 'transparent'}}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricsViz;