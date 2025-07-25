import React, { useMemo } from 'react';
import { Order } from '../../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartProps {
  data: Order[];
}

const COLORS = {
    'Net Order Value': '#3b82f6', // A standard blue
    'Reserve': '#f59e0b'     // Amber
};

const BookingStatusChart: React.FC<ChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const totalAmount = data.reduce((acc, item) => acc + item.amount, 0);
    const totalReserve = data.reduce((acc, item) => acc + item.reserve, 0);

    return [
        { name: 'Net Order Value', value: totalAmount - totalReserve },
        { name: 'Reserve', value: totalReserve }
    ].filter(d => d.value > 0);
  }, [data]);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) { // Don't render for small slices
        return null;
    }

    return (
        <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontWeight="bold"
        fontSize={14}
        style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.5)'}}
        >
        {`$${(value / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}k`}
        </text>
    );
  };

  return (
    <div className="bg-surface/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-border-default h-[400px]">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Order Value vs. Reserve</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            paddingAngle={5}
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} stroke={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
                backgroundColor: 'rgba(22, 27, 34, 0.9)',
                backdropFilter: 'blur(4px)',
                border: '1px solid #30363d',
                borderRadius: '0.75rem',
            }}
            itemStyle={{ color: '#e6edf3' }}
            formatter={(value: number) => `$${value.toLocaleString()}`} 
          />
          <Legend wrapperStyle={{ color: '#a1aab4' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingStatusChart;