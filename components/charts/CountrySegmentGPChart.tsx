



import React, { useMemo } from 'react';
import { GPData } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ChartEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-muted space-y-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6" />
        </svg>
        <p className="text-sm">No data to display for this selection.</p>
    </div>
);

const COLORS = ['#2dd4bf', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899', '#64748b'];

const CustomTooltip = ({ active, label, countryData, segmentColors }: any) => {
  if (active && label && countryData[label]) {
    const countryName = label;
    const segmentsForCountry = Object.entries(countryData[label])
      .map(([segment, gp]) => ({ segment, gp: gp as number }))
      .sort((a, b) => b.gp - a.gp)
      .slice(0, 10);

    if (segmentsForCountry.length === 0) {
      return (
        <div className="bg-surface/95 backdrop-blur-sm p-3 rounded-xl border border-border-default shadow-lg text-sm">
          <p className="font-bold text-text-primary mb-2 text-base">{countryName}</p>
          <p className="text-text-secondary">No segment data for this country.</p>
        </div>
      );
    }
    
    return (
      <div className="bg-surface/95 backdrop-blur-sm p-4 rounded-xl border border-border-default shadow-lg">
        <p className="font-bold text-text-primary mb-2 text-base">{countryName}</p>
        <ul className="space-y-1 text-sm">
          {segmentsForCountry.map(({ segment, gp }) => (
            <li key={segment} className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-sm mr-2" style={{ backgroundColor: segmentColors[segment] || '#888' }}></span>
                <span className="text-text-secondary whitespace-nowrap">{segment} :</span>
              </div>
              <span className="font-semibold text-text-primary ml-4">
                {gp.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};


const CountrySegmentGPChart: React.FC<{ data: GPData[] }> = ({ data }) => {
  const { chartData, stacks, fullCountryData, segmentColors } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], stacks: [], fullCountryData: {}, segmentColors: {} };
    }

    const dataWithSegments = data.filter(item => item.segment && item.segment !== 'N/A');

    // 1. Group all data by country and then by segment for the tooltip
    const countryDataGrouped: { [country: string]: { [segment: string]: number } } = {};
    dataWithSegments.forEach(item => {
        if (!countryDataGrouped[item.country]) {
            countryDataGrouped[item.country] = {};
        }
        if (!countryDataGrouped[item.country][item.segment]){
            countryDataGrouped[item.country][item.segment] = 0;
        }
        countryDataGrouped[item.country][item.segment] += item.gp;
    });

    // 2. Determine top segments for stacking and create color map
    const segmentGPs: { [segment: string]: number } = {};
    dataWithSegments.forEach(item => {
      segmentGPs[item.segment] = (segmentGPs[item.segment] || 0) + item.gp;
    });

    const topN = 5;
    const sortedGlobalSegments = Object.keys(segmentGPs).sort((a, b) => segmentGPs[b] - segmentGPs[a]);
    const topSegments = sortedGlobalSegments.slice(0, topN);
    const legendStacks = [...topSegments, 'Others'];

    const colors: { [key: string]: string } = {};
    legendStacks.forEach((segment, index) => {
      colors[segment] = COLORS[index % COLORS.length];
    });

    // 3. Create pivot data for the chart's stacked bars
    interface PivotDataRow {
      name: string;
      [key: string]: string | number;
    }
    const pivotData: { [country: string]: PivotDataRow } = {};
    dataWithSegments.forEach(item => {
      const country = item.country;
      if (!pivotData[country]) {
        pivotData[country] = { name: country };
        legendStacks.forEach(stackName => {
          pivotData[country][stackName] = 0;
        });
      }
      
      const segment = item.segment;
      const stack = topSegments.includes(segment) ? segment : 'Others';
      pivotData[country][stack] = (pivotData[country][stack] as number) + item.gp;
    });

    const finalChartData = Object.values(pivotData).sort((a, b) => {
        const totalA = legendStacks.reduce((sum, stack) => sum + ((a[stack] as number) || 0), 0);
        const totalB = legendStacks.reduce((sum, stack) => sum + ((b[stack] as number) || 0), 0);
        return totalB - totalA;
    });

    return { chartData: finalChartData, stacks: legendStacks, fullCountryData: countryDataGrouped, segmentColors: colors };
  }, [data]);

  return (
    <div className="bg-surface/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-border-default h-[500px]"> 
      <h3 className="text-lg font-semibold text-text-primary mb-4">Gross Profit by Country and Segment</h3>
       {chartData.length > 0 ?
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 85 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} interval={0} tick={{fontSize: 12, fill: '#94a3b8'}} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `$${(Number(value) / 1000).toLocaleString()}k`} />
            <Tooltip 
              content={<CustomTooltip countryData={fullCountryData} segmentColors={segmentColors} />}
              cursor={{ fill: 'rgba(45, 212, 191, 0.1)' }} 
            />
            <Legend verticalAlign="top" wrapperStyle={{ color: '#94a3b8', marginBottom: '20px' }}/>
            {stacks.map((stack, index) => (
              <Bar
                key={stack}
                dataKey={stack}
                stackId="a"
                fill={COLORS[index % COLORS.length]}
                name={stack}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
       :
        <ChartEmptyState />
       }
    </div>
  );
};

export default CountrySegmentGPChart;