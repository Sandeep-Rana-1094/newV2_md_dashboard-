
import React, { useMemo } from 'react';
import { GPData } from '../../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartProps {
  data: GPData[];
}

const COLORS = ['#059669', '#2563eb', '#f59e0b', '#9333ea', '#ec4899', '#64748b'];

const ChartEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-muted space-y-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        <p className="text-sm">No data to display for this selection.</p>
    </div>
);


const SegmentGPChart: React.FC<ChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const segmentData: { [key: string]: number } = {};
    data.forEach(item => {
        if (!segmentData[item.segment]) {
            segmentData[item.segment] = 0;
        }
        segmentData[item.segment] += item.gp;
    });
    return Object.entries(segmentData)
        .map(([name, value]) => ({ name, value }))
        .filter(d => d.value > 0)
        .sort((a,b) => b.value - a.value);
  }, [data]);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontWeight="bold" fontSize={14}>
        {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
  };

  return (
    <div className="bg-surface/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-border-default h-[500px]">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Gross Profit Distribution by Segment</h3>
      {chartData.length > 0 ?
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              paddingAngle={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                }} 
                itemStyle={{ color: '#f1f5f9' }}
                formatter={(value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} 
            />
            <Legend wrapperStyle={{ color: '#94a3b8' }} />
          </PieChart>
        </ResponsiveContainer>
      :
        <ChartEmptyState />
      }
    </div>
  );
};

export default SegmentGPChart;