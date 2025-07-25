



import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { GPData } from '../types';
import { fetchGPData } from '../services/dataService';
import KpiCard from './KpiCard';
import GPDataTable from './GPDataTable';
import CountrySegmentGPChart from './charts/CountrySegmentGPChart';
import TopSegmentsGPChart from './charts/TopProductsGPChart';

const RefreshIcon = ({ spinning }: { spinning: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${spinning ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    </svg>
);

// Icons for KPI Cards
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v1m0 6v1m6-4H6" /></svg>;
const GlobeAltIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" /></svg>;
const CubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


export const GPDashboard: React.FC = () => {
  const [data, setData] = useState<GPData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFilters] = useState({ country: '', segment: '' });

  const getData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    setError(null);
    try {
        const gpData = await fetchGPData();
        setData(gpData);
        setLastUpdated(new Date());
        if (gpData.length === 0 && loading) {
            setError("No data found for Country Wise GP. The Google Sheet might be empty or not shared publicly.");
        }
    } catch (e: any) {
        console.error(e);
        setError(e.message || "An unexpected error occurred while loading GP data.");
    } finally {
        setLoading(false);
        if (isManualRefresh) setIsRefreshing(false);
    }
  }, [loading]);

  useEffect(() => {
    getData();
    const intervalId = setInterval(() => getData(), 60000);
    return () => clearInterval(intervalId);
  }, [getData]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ country: '', segment: '' });
  };

  const uniqueCountries = useMemo(() => [...new Set(data.map(item => item.country))].sort(), [data]);
  const uniqueSegments = useMemo(() => [...new Set(data.map(item => item.segment))].sort(), [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
        const { country, segment } = filters;
        if (country && item.country !== country) return false;
        if (segment && item.segment !== segment) return false;
        return true;
    });
  }, [data, filters]);

  const kpis = useMemo(() => {
    if (filteredData.length === 0) {
      return { totalGP: 0, topCountry: 'N/A', topSegment: 'N/A' };
    }

    const totalGP = filteredData.reduce((acc, curr) => acc + curr.gp, 0);

    const countryGP: { [key: string]: number } = {};
    filteredData.forEach(item => {
      countryGP[item.country] = (countryGP[item.country] || 0) + item.gp;
    });
    const topCountry = Object.entries(countryGP).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
    
    const segmentGP: { [key: string]: number } = {};
    filteredData.forEach(item => {
      segmentGP[item.segment] = (segmentGP[item.segment] || 0) + item.gp;
    });
    const topSegment = Object.entries(segmentGP).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    return { totalGP, topCountry, topSegment };
  }, [filteredData]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-red-900/20 p-8 rounded-xl border border-red-500/30">
            <h2 className="text-2xl font-bold text-red-300 mb-4">Failed to Load Data</h2>
            <p className="text-text-secondary max-w-md">{error}</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-primary">Country Wise GP</h1>
        <div className="flex items-center space-x-4">
            {lastUpdated && (
                <p className="text-sm text-muted hidden sm:block">Last Updated: {lastUpdated.toLocaleTimeString()}</p>
            )}
            <button 
                onClick={() => getData(true)}
                disabled={isRefreshing}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-primary bg-surface/50 border border-border-default rounded-lg hover:bg-surface disabled:opacity-50"
            >
                <RefreshIcon spinning={isRefreshing} />
                <span className="ml-2">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
        </div>
      </div>

      <div className="bg-surface/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-border-default">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3 text-primary"><FilterIcon /><h3 className="text-xl font-semibold">Filters</h3></div>
            <button onClick={clearFilters} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-muted bg-surface/50 border border-border-default rounded-lg hover:bg-surface"><XCircleIcon /><span className="ml-2">Clear Filters</span></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-text-secondary mb-1">Country</label>
            <select name="country" id="country" value={filters.country} onChange={handleFilterChange} className="block w-full px-3 py-2 bg-slate-900 border border-border-default rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                <option value="">All Countries</option>
                {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="segment" className="block text-sm font-medium text-text-secondary mb-1">Segment</label>
            <select name="segment" id="segment" value={filters.segment} onChange={handleFilterChange} className="block w-full px-3 py-2 bg-slate-900 border border-border-default rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                <option value="">All Segments</option>
                {uniqueSegments.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KpiCard title="Total Gross Profit" value={kpis.totalGP.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<DollarSignIcon />} color="green" />
        <KpiCard title="Top Country by GP" value={kpis.topCountry} icon={<GlobeAltIcon />} color="blue" />
        <KpiCard title="Top Segment by GP" value={kpis.topSegment} icon={<CubeIcon />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CountrySegmentGPChart data={filteredData} />
        <TopSegmentsGPChart data={filteredData} />
      </div>
      
      <div>
        <GPDataTable data={filteredData} />
      </div>
    </div>
  );
};