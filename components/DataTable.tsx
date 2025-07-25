import React, { useState, useEffect, useMemo } from 'react';
import { Order } from '../types';

interface DataTableProps {
  data: Order[];
}

const ROWS_PER_PAGE = 10;

const SortIcon: React.FC<{ direction: 'ascending' | 'descending' | null }> = ({ direction }) => {
    if (!direction) return <span className="text-muted">↑↓</span>;
    return direction === 'ascending' ? <span className="text-primary">↑</span> : <span className="text-primary">↓</span>;
};


const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });

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
  
  const requestSort = (key: keyof Order) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  useEffect(() => {
    setCurrentPage(1);
  }, [data, sortConfig]);


  const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };
  
  const getSortDirection = (key: keyof Order) => {
      if (!sortConfig || sortConfig.key !== key) return null;
      return sortConfig.direction;
  }

  const renderHeader = (label: string, key: keyof Order, className: string = "") => (
    <th scope="col" className={`px-6 py-3 ${className}`}>
        <button onClick={() => requestSort(key)} className="flex items-center space-x-2">
            <span>{label}</span>
            <SortIcon direction={getSortDirection(key)} />
        </button>
    </th>
  );


  return (
    <div className="bg-surface/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-border-default">
      <h3 className="text-lg font-semibold text-text-primary mb-4">All Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-text-secondary">
          <thead className="text-xs text-text-secondary uppercase bg-surface font-medium">
            <tr>
              {renderHeader('Date', 'date')}
              {renderHeader('Order FY', 'orderFy')}
              {renderHeader('Order No.', 'orderNo')}
              {renderHeader('Party Name', 'partyName')}
              {renderHeader('Segment', 'segment')}
              {renderHeader('Order Value (USD)', 'amount', 'text-right')}
              {renderHeader('Reserve (USD)', 'reserve', 'text-right')}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={`${item.orderNo}-${index}-${item.date}`} className="border-b border-border-default transition-colors odd:bg-surface/30 even:bg-surface/50 hover:bg-primary/10">
                <td className="px-6 py-4 whitespace-nowrap">{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td className="px-6 py-4">{item.orderFy}</td>
                <td className="px-6 py-4">{item.orderNo}</td>
                <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">{item.partyName}</td>
                <td className="px-6 py-4">{item.segment}</td>
                <td className="px-6 py-4 text-right font-medium text-text-primary">
                    {item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </td>
                <td className="px-6 py-4 text-right font-medium text-amber-400">
                  {item.reserve > 0 ? item.reserve.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '-'}
                </td>
              </tr>
            ))}
             {paginatedData.length === 0 && (
                <tr>
                    <td colSpan={7} className="text-center py-10 text-muted">No data available.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
            <span className="text-sm text-muted">
            Showing {data.length > 0 ? ((currentPage - 1) * ROWS_PER_PAGE) + 1 : 0}-{(currentPage * ROWS_PER_PAGE) > data.length ? data.length : (currentPage * ROWS_PER_PAGE)} of {data.length}
            </span>
            <div className="flex space-x-2">
            <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium bg-surface border border-border-default rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 text-sm font-medium bg-surface border border-border-default rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;