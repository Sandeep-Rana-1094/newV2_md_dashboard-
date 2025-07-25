

import React, { useMemo } from 'react';
import { GPData } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface ChartProps {
  data: GPData[];
}

const ChartEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-muted space-y-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-sm">No segment data to display for this selection.</p>
    </div>
);

const TopSegmentsGPChart: React.FC<ChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const segmentData: { [key: string]: number } = {};
    
    data.forEach(item => {
        if (!item.segment || item.segment === 'N/A') return;

        if (!segmentData[item.segment]) {
            segmentData[item.segment] = 0;
        }
        segmentData[item.segment] += item.gp;
    });

    return Object.entries(segmentData)
        .map(([segmentName, gp]) => ({
            segmentName,
            gp,
        }))
        .sort((a, b) => b.gp - a.gp)
        .slice(0, 10);
  }, [data]);

  return (
    <div className="bg-surface/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-border-default h-[500px]"> 
      <h3 className="text-lg font-semibold text-text-primary mb-4">Top 10 Segments by Gross Profit</h3>
       {chartData.length > 0 ?
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 60, left: 30, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `$${(Number(value) / 1000).toLocaleString()}k`} />
            <YAxis type="category" dataKey="segmentName" stroke="#94a3b8" width={200} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
              }} 
              cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }} 
              itemStyle={{ color: '#f1f5f9' }}
              labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Gross Profit"]}
            />
            <Bar dataKey="gp" name="Gross Profit" fill="#a855f7" barSize={20}>
                <LabelList 
                    dataKey="gp" 
                    position="right" 
                    formatter={(value: number) => `$${(value / 1000).toLocaleString('en-US', {maximumFractionDigits: 0})}k`} 
                    style={{ fill: '#a1aab4', fontSize: 12 }}
                />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
       :
        <ChartEmptyState />
       }
    </div>
  );
};

export default TopSegmentsGPChart;
