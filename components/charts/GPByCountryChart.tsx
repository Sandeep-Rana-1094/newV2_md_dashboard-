
import React, { useMemo } from 'react';
import { GPData } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartProps {
  data: GPData[];
}

const ChartEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-muted space-y-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6" />
        </svg>
        <p className="text-sm">No data to display for this selection.</p>
    </div>
);


const GPByCountryChart: React.FC<ChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const countryData: { [key: string]: { gp: number; exportValue: number; importValue: number; } } = {};
    
    data.forEach(item => {
        if (!countryData[item.country]) {
            countryData[item.country] = { gp: 0, exportValue: 0, importValue: 0 };
        }
        countryData[item.country].gp += item.gp;
        countryData[item.country].exportValue += item.exportValue;
        countryData[item.country].importValue += item.importValue;
    });

    return Object.entries(countryData)
        .map(([name, values]) => ({
            name,
            'Gross Profit': values.gp,
            'Export Value': values.exportValue,
            'Import Value': values.importValue,
        }))
        .sort((a, b) => b['Gross Profit'] - a['Gross Profit']);
  }, [data]);

  return (
    <div className="bg-surface/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-border-default h-[500px]"> 
      <h3 className="text-lg font-semibold text-text-primary mb-4">All countries GP, Export and Import</h3>
       {chartData.length > 0 ?
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 85 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} interval={0} tick={{fontSize: 12, fill: '#94a3b8'}} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `$${(Number(value) / 1000).toLocaleString()}k`} />
            <Tooltip 
              contentStyle={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
              }} 
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} 
              itemStyle={{ color: '#f1f5f9' }}
              labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />
            <Legend verticalAlign="top" wrapperStyle={{ color: '#94a3b8', marginBottom: '20px' }}/>
            <Bar dataKey="Gross Profit" fill="#22c55e" name="Gross Profit" />
            <Bar dataKey="Export Value" fill="#3b82f6" name="Export Value" />
            <Bar dataKey="Import Value" fill="#f59e0b" name="Import Value" />
          </BarChart>
        </ResponsiveContainer>
       :
        <ChartEmptyState />
       }
    </div>
  );
};

export default GPByCountryChart;