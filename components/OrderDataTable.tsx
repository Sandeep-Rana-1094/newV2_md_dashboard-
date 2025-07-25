import React, { useState, useEffect, useMemo } from 'react';
import { CombinedOrderData } from '../types';

const ROWS_PER_PAGE = 10;

const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
const SortIcon: React.FC<{ direction: 'ascending' | 'descending' | null }> = ({ direction }) => {
    if (!direction) return <span className="text-muted">↑↓</span>;
    return direction === 'ascending' ? <span className="text-primary">↑</span> : <span className="text-primary">↓</span>;
};


const OrderDataTable: React.FC<{ data: CombinedOrderData[] }> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: keyof CombinedOrderData; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });

  // Sorting Logic
  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);
  
  const requestSort = (key: keyof CombinedOrderData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  useEffect(() => {
    setCurrentPage(1);
    setExpandedRows(new Set());
  }, [sortedData]);

  const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);
  const paginatedData = sortedData.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const toggleRow = (orderNo: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(orderNo)) {
        newSet.delete(orderNo);
    } else {
        newSet.add(orderNo);
    }
    setExpandedRows(newSet);
  };

  const goToNextPage = () => setCurrentPage((page) => Math.min(page + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((page) => Math.max(page - 1, 1));
  
  const getSortDirection = (key: keyof CombinedOrderData) => {
      if (!sortConfig || sortConfig.key !== key) return null;
      return sortConfig.direction;
  }

  const renderHeader = (label: string, key: keyof CombinedOrderData, className: string = "") => (
    <th scope="col" className={`px-6 py-3 ${className}`}>
        <button onClick={() => requestSort(key)} className="flex items-center space-x-2 whitespace-nowrap">
            <span>{label}</span>
            <SortIcon direction={getSortDirection(key)} />
        </button>
    </th>
  );


  return (
    <div className="bg-surface/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-border-default">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Order Details</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-text-secondary">
          <thead className="text-xs text-text-secondary uppercase bg-surface font-medium">
            <tr>
              <th scope="col" className="px-6 py-3 w-12"></th>
              {renderHeader('Date', 'date')}
              {renderHeader('Order No.', 'orderNo')}
              {renderHeader('Sales Person', 'salesPerson')}
              {renderHeader('Country', 'country')}
              {renderHeader('Segment', 'segment')}
              {renderHeader('Products', 'productCount', 'text-right')}
              {renderHeader('Amount (USD)', 'amount', 'text-right')}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((order) => {
              const isExpanded = expandedRows.has(order.orderNo);
              return (
              <React.Fragment key={order.orderNo}>
                <tr className="border-b border-border-default transition-colors odd:bg-surface/30 even:bg-surface/50 hover:bg-primary/10 cursor-pointer" onClick={() => toggleRow(order.orderNo)}>
                  <td className="px-6 py-4 text-center">{isExpanded ? <ChevronDownIcon/> : <ChevronRightIcon/>}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">{order.orderNo}</td>
                  <td className="px-6 py-4">{order.salesPerson}</td>
                  <td className="px-6 py-4">{order.country}</td>
                  <td className="px-6 py-4">{order.segment}</td>
                  <td className="px-6 py-4 text-right">{order.productCount}</td>
                  <td className="px-6 py-4 text-right font-medium text-text-primary">{order.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                </tr>
                {isExpanded && (
                  <tr className="bg-background">
                    <td colSpan={8} className="p-0">
                      <div className="p-4 bg-black/20">
                        <h4 className="text-md font-semibold text-primary mb-2 ml-4">Products in Order #{order.orderNo}</h4>
                        {order.products.length > 0 ? (
                        <table className="w-full text-sm">
                          <thead className="text-xs text-muted">
                              <tr>
                                  <th className="px-6 py-2 text-left">Product Code</th>
                                  <th className="px-6 py-2 text-left">Product Name</th>
                                  <th className="px-6 py-2 text-right">Quantity</th>
                              </tr>
                          </thead>
                          <tbody>
                            {order.products.map(p => (
                                <tr key={p.productCode} className="border-b border-border-default/50 last:border-b-0">
                                    <td className="px-6 py-3">{p.productCode}</td>
                                    <td className="px-6 py-3 text-text-primary">{p.productName}</td>
                                    <td className="px-6 py-3 text-right font-bold text-text-primary">{p.quantity}</td>
                                </tr>
                            ))}
                          </tbody>
                        </table>
                        ) : (
                            <p className="text-center py-4 text-muted">No products found for this order.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )})}
            {paginatedData.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-muted">No data available.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
            <span className="text-sm text-muted">Showing {data.length > 0 ? ((currentPage - 1) * ROWS_PER_PAGE) + 1 : 0}-{(currentPage * ROWS_PER_PAGE) > data.length ? data.length : (currentPage * ROWS_PER_PAGE)} of {data.length}</span>
            <div className="flex space-x-2">
            <button onClick={goToPreviousPage} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium bg-surface border border-border-default rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <button onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0} className="px-4 py-2 text-sm font-medium bg-surface border border-border-default rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default OrderDataTable;