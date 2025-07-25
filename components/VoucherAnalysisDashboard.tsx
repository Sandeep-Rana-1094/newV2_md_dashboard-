
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { OrderData, OrderProduct, CombinedOrderData } from '../types';
import { fetchOrderData, fetchOrderProducts } from '../services/dataService';
import KpiCard from './KpiCard';
import VoucherDataTable from './VoucherDataTable';
import ProductSalesTable from './ProductSalesTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';

// --- ICONS ---
const RefreshIcon = ({ spinning }: { spinning: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${spinning ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /></svg>
);
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v1m0 6v1m6-4H6" /></svg>;
const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const PackageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;

// --- INLINE CHART COMPONENTS ---
const TopProductsChart: React.FC<{ data: CombinedOrderData[] }> = ({ data }) => {
    const chartData = useMemo(() => {
        const productQuantities: { [code: string]: { name: string; quantity: number } } = {};
        data.forEach(order => {
            order.products.forEach(product => {
                if (!productQuantities[product.productCode]) {
                    productQuantities[product.productCode] = { name: product.productName, quantity: 0 };
                }
                productQuantities[product.productCode].quantity += product.quantity;
            });
        });
        return Object.entries(productQuantities)
            .map(([code, { name, quantity }]) => ({ 
                displayName: `${name} (${code})`,
                quantity 
            }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
    }, [data]);

    return (
        <div className="bg-surface/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-border-default h-[400px]">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Top 10 Products by Quantity Sold</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 50, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                    <YAxis type="category" dataKey="displayName" stroke="#94a3b8" width={200} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid #334155', borderRadius: '0.75rem' }} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} itemStyle={{ color: '#f1f5f9' }} labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }} />
                    <Bar dataKey="quantity" name="Total Quantity" fill="#a855f7" barSize={20}>
                        <LabelList dataKey="quantity" position="right" style={{ fill: '#94a3b8', fontSize: 12 }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


// --- MAIN DASHBOARD COMPONENT ---
export const VoucherAnalysisDashboard: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const getData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    setError(null);
    try {
      const [orderData, productData] = await Promise.all([fetchOrderData(), fetchOrderProducts()]);
      setOrders(orderData);
      setProducts(productData);
      setLastUpdated(new Date());
      if (orderData.length === 0 && loading) {
        setError("No data found. This might be because the Google Sheet is empty or not shared publicly. Please ensure headers are in the first row.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred while loading dashboard data.");
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
  
  const combinedData = useMemo((): CombinedOrderData[] => {
    if (!orders.length) return [];
    const productsByOrder = products.reduce((acc, product) => {
      (acc[product.orderNo] = acc[product.orderNo] || []).push(product);
      return acc;
    }, {} as Record<string, OrderProduct[]>);

    return orders.map(order => ({
      ...order,
      products: productsByOrder[order.orderNo] || [],
      productCount: (productsByOrder[order.orderNo] || []).length,
    }));
  }, [orders, products]);

  const kpis = useMemo(() => {
    const totalAmount = combinedData.reduce((acc, curr) => acc + curr.amount, 0);
    const orderCount = combinedData.length;
    const totalQuantity = combinedData.reduce((acc, curr) => acc + curr.products.reduce((pAcc, p) => pAcc + p.quantity, 0), 0);
    
    return { totalAmount, orderCount: orderCount, totalQuantity };
  }, [combinedData]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div></div>;
  }

  if (error && orders.length === 0) {
    return <div className="flex flex-col items-center justify-center h-full text-center bg-red-900/20 p-8 rounded-xl border border-red-500/30"><h2 className="text-2xl font-bold text-red-300 mb-4">Failed to Load Data</h2><p className="text-text-secondary max-w-md">{error}</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-primary">Rodrigo Analysis</h1>
        <div className="flex items-center space-x-4">
          {lastUpdated && <p className="text-sm text-muted hidden sm:block">Last Updated: {lastUpdated.toLocaleTimeString()}</p>}
          <button onClick={() => getData(true)} disabled={isRefreshing} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-primary bg-surface/50 border border-border-default rounded-lg hover:bg-surface disabled:opacity-50"><RefreshIcon spinning={isRefreshing} /><span className="ml-2">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span></button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard title="Total Sales" value={kpis.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<DollarSignIcon />} color="blue" />
        <KpiCard title="Total Order number" value={kpis.orderCount.toLocaleString()} icon={<ShoppingCartIcon />} color="green" />
        <KpiCard title="Total Items Sold" value={kpis.totalQuantity.toLocaleString()} icon={<PackageIcon />} color="purple" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TopProductsChart data={combinedData} />
      </div>
      
      <ProductSalesTable data={combinedData} />

      <VoucherDataTable data={combinedData} />
    </div>
  );
};
