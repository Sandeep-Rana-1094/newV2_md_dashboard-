

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Order } from '../types';
import { fetchOrders } from '../services/dataService';
import KpiCard from './KpiCard';
import CountryDistributionChart from './charts/CountryDistributionChart';
import BookingStatusChart from './charts/BookingStatusChart';
import DataTable from './DataTable';

const RefreshIcon = ({ spinning }: { spinning: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${spinning ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2v6h-6" />
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    </svg>
);


// Icons for KPI Cards
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v1m0 6v1m6-4H6" /></svg>;
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const ShoppingBagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const ChartPieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>

export const LatamReserveDashboard: React.FC = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    orderNumber: '',
    partyName: '',
  });

  const getData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
        setIsRefreshing(true);
    }
    setError(null);
    try {
        const orderData = await fetchOrders();
        setData(orderData);
        setLastUpdated(new Date());
        if (orderData.length === 0 && loading) { // Only show initial error
            setError("No data found. This might be because the Google Sheet is empty or not shared publicly.");
        }
    } catch (e: any) {
        console.error(e);
        setError(e.message || "An unexpected error occurred while loading Latam Reserve Dashboard data.");
    } finally {
        setLoading(false);
        if (isManualRefresh) {
            setIsRefreshing(false);
        }
    }
  }, [loading]);

  useEffect(() => {
    getData(); // Initial fetch
    const intervalId = setInterval(() => getData(), 60000); // Auto-refresh every 60 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [getData]);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      orderNumber: '',
      partyName: '',
    });
  };
  
  const uniqueOrderNumbers = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map(order => order.orderNo))].sort();
  }, [data]);

  const uniquePartyNames = useMemo(() => {
      if (!data) return [];
      return [...new Set(data.map(order => order.partyName))].sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(order => {
      const { startDate, endDate, orderNumber, partyName } = filters;
      
      const orderDatePart = order.date.substring(0, 10);
      if (startDate && orderDatePart < startDate) return false;
      if (endDate && orderDatePart > endDate) return false;
      if (orderNumber && order.orderNo !== orderNumber) return false;
      if (partyName && order.partyName !== partyName) return false;
      
      return true;
    });
  }, [data, filters]);

  const { totalAmount, totalReserve, orderCount, avgOrderAmount } = useMemo(() => {
    if (filteredData.length === 0) {
      return { totalAmount: 0, totalReserve: 0, orderCount: 0, avgOrderAmount: 0 };
    }
    const totalAmount = filteredData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalReserve = filteredData.reduce((acc, curr) => acc + (curr.reserve || 0), 0);
    const orderCount = filteredData.length;
    const avgOrderAmount = orderCount > 0 ? totalAmount / orderCount : 0;

    return { totalAmount, totalReserve, orderCount, avgOrderAmount };
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
            <p className="text-text-secondary max-w-2xl mb-4">
                {error} To fix this, please follow these steps:
            </p>
            <div className="text-left text-text-secondary bg-surface/50 p-6 rounded-lg border border-border-default">
                <h3 className="font-semibold text-text-primary mb-2">How to Share Your Google Sheet:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Open your Google Sheet.</li>
                    <li>Click the <span className="font-bold text-primary">"Share"</span> button in the top-right corner.</li>
                    <li>Under <span className="font-bold">"General access"</span>, change "Restricted" to <span className="font-bold text-secondary">"Anyone with the link"</span>.</li>
                    <li>Ensure the role is set to at least "Viewer".</li>
                    <li>Click <span className="font-bold">"Done"</span> and then refresh this page.</li>
                </ol>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-text-primary">Latam Reserve Dashboard</h1>
            <p className="text-lg font-bold text-muted mt-1">Since July 2025</p>
        </div>
        <div className="flex items-center space-x-4">
            {lastUpdated && (
                <p className="text-sm text-muted hidden sm:block">
                    Last Updated: {lastUpdated.toLocaleString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    })}
                </p>
            )}
            <button 
                onClick={() => getData(true)}
                disabled={isRefreshing}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-primary bg-surface/50 border border-border-default rounded-lg hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-wait"
            >
                <RefreshIcon spinning={isRefreshing} />
                <span className="ml-2">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-surface/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-border-default">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3 text-primary">
                <FilterIcon />
                <h3 className="text-xl font-semibold">Filters</h3>
            </div>
            <button 
                onClick={clearFilters}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-muted bg-surface/50 border border-border-default rounded-lg hover:bg-surface"
            >
                <XCircleIcon />
                <span className="ml-2">Clear Filters</span>
            </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-text-secondary mb-1">Start Date</label>
                <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="block w-full px-3 py-2 bg-slate-900 border border-border-default rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-text-secondary mb-1">End Date</label>
                <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="block w-full px-3 py-2 bg-slate-900 border border-border-default rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-text-secondary mb-1">Order Number</label>
                <select name="orderNumber" id="orderNumber" value={filters.orderNumber} onChange={handleFilterChange} className="block w-full px-3 py-2 bg-slate-900 border border-border-default rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                    <option value="">All Orders</option>
                    {uniqueOrderNumbers.map(orderNo => (
                        <option key={orderNo} value={orderNo}>{orderNo}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="partyName" className="block text-sm font-medium text-text-secondary mb-1">Party Name</label>
                <select name="partyName" id="partyName" value={filters.partyName} onChange={handleFilterChange} className="block w-full px-3 py-2 bg-slate-900 border border-border-default rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                    <option value="">All Parties</option>
                    {uniquePartyNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>


      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
            title="Total Order Value" 
            value={`$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<DollarSignIcon />}
            color="blue"
        />
        <KpiCard 
            title="Total Reserve" 
            value={totalReserve > 0 ? `$${totalReserve.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'} 
            icon={<CreditCardIcon />}
            color="amber"
        />
        <KpiCard 
            title="Total Orders" 
            value={orderCount.toLocaleString()} 
            icon={<ShoppingBagIcon />}
            color="green"
        />
        <KpiCard 
            title="Avg. Order Value" 
            value={`$${avgOrderAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
            icon={<ChartPieIcon />}
            color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <CountryDistributionChart data={filteredData} />
        </div>
        <div>
            <BookingStatusChart data={filteredData} />
        </div>
      </div>
      
      {/* Data Table */}
      <div>
        <DataTable data={filteredData} />
      </div>
    </div>
  );
};