import React, { useState, useMemo, useEffect } from 'react';
import { CombinedOrderData } from '../types';

// Updated interface to hold more dynamic information
interface ProductSale {
    productCode: string;
    productName: string;
    totalQuantity: number;
    orderCount: number;
    avgQuantityPerOrder: number;
    percentageOfTotal: number;
}

interface ProductSalesTableProps {
  data: CombinedOrderData[];
}

const ROWS_PER_PAGE = 10;

const SortIcon: React.FC<{ direction: 'ascending' | 'descending' | null }> = ({ direction }) => {
    if (!direction) return <span className="text-muted">↑↓</span>;
    return direction === 'ascending' ? <span className="text-primary">↑</span> : <span className="text-primary">↓</span>;
};

const ProductSalesTable: React.FC<ProductSalesTableProps> = ({ data }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const productSales = useMemo((): ProductSale[] => {
        const productStats: { [code: string]: { name: string, quantity: number, orders: Set<string> } } = {};
        data.forEach(order => {
            order.products.forEach(product => {
                if (!productStats[product.productCode]) {
                    productStats[product.productCode] = { name: product.productName, quantity: 0, orders: new Set() };
                }
                productStats[product.productCode].quantity += product.quantity;
                productStats[product.productCode].orders.add(order.orderNo);
            });
        });

        const overallTotalQuantity = Object.values(productStats).reduce((sum, p) => sum + p.quantity, 0);

        return Object.entries(productStats)
            .map(([code, { name, quantity, orders }]) => {
                const orderCount = orders.size;
                return {
                    productCode: code,
                    productName: name,
                    totalQuantity: quantity,
                    orderCount: orderCount,
                    avgQuantityPerOrder: orderCount > 0 ? quantity / orderCount : 0,
                    percentageOfTotal: overallTotalQuantity > 0 ? (quantity / overallTotalQuantity) * 100 : 0,
                };
            })
    }, [data]);
    
    const [sortConfig, setSortConfig] = useState<{ key: keyof ProductSale; direction: 'ascending' | 'descending' } | null>({ key: 'totalQuantity', direction: 'descending' });

    const sortedProductSales = useMemo(() => {
        let sortableItems = [...productSales];
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
    }, [productSales, sortConfig]);

    const requestSort = (key: keyof ProductSale) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [sortedProductSales]);

    const totalPages = Math.ceil(sortedProductSales.length / ROWS_PER_PAGE);
    const paginatedData = sortedProductSales.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
    );

    const goToNextPage = () => {
        setCurrentPage((page) => Math.min(page + 1, totalPages));
    };

    const goToPreviousPage = () => {
        setCurrentPage((page) => Math.max(page - 1, 1));
    };
    
    const getSortDirection = (key: keyof ProductSale) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction;
    }
  
    const renderHeader = (label: string, key: keyof ProductSale, className: string = "") => (
        <th scope="col" className={`px-6 py-3 ${className}`}>
            <button onClick={() => requestSort(key)} className="flex items-center space-x-2">
                <span>{label}</span>
                <SortIcon direction={getSortDirection(key)} />
            </button>
        </th>
    );

    return (
        <div className="bg-surface/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-border-default border-t-4 border-primary">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Product Sales Summary</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-text-secondary">
                    <thead className="text-xs text-primary uppercase bg-primary/10 font-semibold">
                        <tr>
                            {renderHeader('Product Code', 'productCode')}
                            {renderHeader('Product Name', 'productName')}
                            {renderHeader('Total Qty Sold', 'totalQuantity', 'text-right')}
                            {renderHeader('# Orders', 'orderCount', 'text-right')}
                            {renderHeader('Avg Qty/Order', 'avgQuantityPerOrder', 'text-right')}
                            {renderHeader('% of Total Items', 'percentageOfTotal', 'text-right')}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((product) => (
                            <tr key={product.productCode} className="border-b border-border-default transition-colors odd:bg-surface/30 even:bg-surface/50 hover:bg-primary/10">
                                <td className="px-6 py-4">{product.productCode}</td>
                                <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">{product.productName}</td>
                                <td className="px-6 py-4 text-right font-bold text-text-primary">{product.totalQuantity.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">{product.orderCount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">{product.avgQuantityPerOrder.toFixed(1)}</td>
                                <td className="px-6 py-4 text-right text-primary font-medium">{product.percentageOfTotal.toFixed(2)}%</td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-muted">No product data available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                 <div className="flex justify-between items-center pt-4">
                    <span className="text-sm text-muted">
                        Showing {sortedProductSales.length > 0 ? ((currentPage - 1) * ROWS_PER_PAGE) + 1 : 0}-{(currentPage * ROWS_PER_PAGE) > sortedProductSales.length ? sortedProductSales.length : (currentPage * ROWS_PER_PAGE)} of {sortedProductSales.length}
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

export default ProductSalesTable;