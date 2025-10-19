import React from 'react';

const StockBadge = ({ stock }) => {
  // Determine stock status
  const getStockStatus = () => {
    if (!stock || stock === 0) {
      return {
        label: 'Out of Stock',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: '✕'
      };
    } else if (stock <= 5) {
      return {
        label: `Only ${stock} left!`,
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: '⚠️'
      };
    } else if (stock <= 10) {
      return {
        label: `${stock} in stock`,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '📦'
      };
    } else {
      return {
        label: 'In Stock',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: '✓'
      };
    }
  };

  const status = getStockStatus();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.className}`}>
      <span className="mr-1">{status.icon}</span>
      {status.label}
    </span>
  );
};

export default StockBadge;
