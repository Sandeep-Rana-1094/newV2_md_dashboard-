
import React, { useMemo } from 'react';
import { Order } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Legend } from 'recharts';

interface ChartProps {
  data: Order[];
}

const CountryDistributionChart: React.FC<ChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const partyData: { [key: string]: { totalValue: number; reserveValue: number } } = {};
    
    data.forEach(item => {
        if (!partyData[item.partyName]) {
            partyData[item.partyName] = { totalValue: 0, reserveValue: 0 };
        }
        partyData[item.partyName].totalValue += item.amount;
        partyData[item.partyName].reserveValue += item.reserve;
    });

    return Object.entries(partyData)
        .map(([name, values]) => ({
            name,
            totalValue: values.totalValue,
            reserve: values.reserveValue,
            netValue: values.totalValue - values.reserveValue,
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 5);
  }, [data]);

  return (
    <div className="bg-surface/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-border-default h-[400px]">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Top 5 Parties by Order Value</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 60, left: 30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `$${(Number(value) / 1000).toLocaleString()}k`} />
          <YAxis type="category" dataKey="name" stroke="#94a3b8" width={150} tick={{ fill: '#94a3b8', fontSize: 12 }} />
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
            formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
          />
          <Legend wrapperStyle={{ color: '#94a3b8' }} />
          <Bar dataKey="netValue" name="Net Order Value" stackId="a" fill="#3b82f6" barSize={20} />
          <Bar dataKey="reserve" name="Reserve" stackId="a" fill="#f59e0b" barSize={20}>
            <LabelList 
                dataKey="totalValue" 
                position="right" 
                formatter={(value: number) => `$${(value / 1000).toLocaleString('en-US', {maximumFractionDigits: 0})}k`} 
                style={{ fill: '#94a3b8', fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CountryDistributionChart;