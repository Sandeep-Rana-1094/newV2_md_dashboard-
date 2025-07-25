
import React, { useMemo } from 'react';
import { Order } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

interface RevenueChartProps {
  data: Order[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const monthlyAmount: { [key: string]: number } = {};
    data.forEach(item => {
        try {
            const date = new Date(item.date);
            if (isNaN(date.getTime())) return; // Skip invalid dates
            const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!monthlyAmount[month]) {
              monthlyAmount[month] = 0;
            }
            monthlyAmount[month] += item.amount;
        } catch(e){
            // ignore errors with date parsing
        }
    });

    // To ensure correct sorting by date
    const sortedMonths = Object.keys(monthlyAmount).sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        const dateA = new Date(`01-${monthA}-20${yearA}`);
        const dateB = new Date(`01-${monthB}-20${yearB}`);
        return dateA.getTime() - dateB.getTime();
    });

    return sortedMonths.map(month => ({
      name: month,
      'Order Value': monthlyAmount[month],
    }));
  }, [data]);

  return (
    <div className="bg-surface/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-border-default h-[400px]">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Monthly Order Value (USD)</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
          <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `$${(Number(value) / 1000).toLocaleString()}k`} />
          <Tooltip 
            contentStyle={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                backdropFilter: 'blur(4px)',
                border: '1px solid #334155',
                borderRadius: '0.75rem', 
            }}
            itemStyle={{ color: '#f1f5f9' }}
            labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
            formatter={(value: number) => `$${value.toLocaleString()}`} 
          />
          <Legend wrapperStyle={{ color: '#94a3b8' }} />
          <Line type="monotone" dataKey="Order Value" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8, stroke: '#1e293b', strokeWidth: 2 }}>
            <LabelList 
                dataKey="Order Value" 
                position="top" 
                formatter={(value: number) => `$${(value / 1000).toFixed(0)}k`} 
                style={{ fill: '#94a3b8', fontSize: 12 }}
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;