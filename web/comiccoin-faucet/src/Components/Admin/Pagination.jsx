import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  itemName = 'items',
  className = ''
}) => {
  // Handle edge cases and invalid values
  const safeTotalItems = Math.max(0, totalItems || 0);
  const safeCurrentPage = Math.max(1, currentPage || 1);
  const safeItemsPerPage = Math.max(1, itemsPerPage || 10);

  const totalPages = Math.ceil(safeTotalItems / safeItemsPerPage);
  const startItem = safeTotalItems === 0 ? 0 : ((safeCurrentPage - 1) * safeItemsPerPage) + 1;
  const endItem = Math.min(safeCurrentPage * safeItemsPerPage, safeTotalItems);

  if (safeTotalItems === 0) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="text-sm text-gray-600">
          No {itemName} to display
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between gap-4 ${className}`}>
      <div className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of {safeTotalItems} {itemName}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage <= 1}
            className="p-2 rounded-lg border border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50"
          >
            <ChevronLeft className="w-5 h-5 text-purple-600" />
          </button>
          <span className="text-sm text-gray-600">
            Page {safeCurrentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage >= totalPages}
            className="p-2 rounded-lg border border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50"
          >
            <ChevronRight className="w-5 h-5 text-purple-600" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
