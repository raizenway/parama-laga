import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page:number) => void;
}

export default function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange }: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const visiblePages = 5;

    const getPageNumbers = () => {
        const pages = [];

        if (totalPages <= visiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }

        if (currentPage <= 3) {
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push("...");
        } else if (currentPage >= totalPages - 2) {
            pages.push("...");
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push("...");
            for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
            pages.push("...");
        }

        return pages;
    };
  
    return (
      <div className="flex justify-center gap-1 mt-4">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded disabled:opacity-50"
        >
            <ChevronsLeft className="text-primary" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded  disabled:opacity-50"
        >
          <ChevronLeft className="text-primary"/>
        </button>
  
        {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === "number" && onPageChange(page)}
                    className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-primary text-white' : ''}`}
                    disabled={typeof page !== "number"}
                >
                    {page}
                </button>
            ))}
  
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded disabled:opacity-50"
        >
          <ChevronRight className="text-primary" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded disabled:opacity-50"
        >
          <ChevronsRight className="text-primary" />
        </button>
      </div>
    );
  }
