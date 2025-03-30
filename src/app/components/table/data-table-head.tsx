import { DataTableFilter } from "@/app/components/function/data-table-filter";
import { FilterConfig } from "@/app/types/filter";

interface DataTableHeadProps {
  columns: {
    key: string;
    header: string;
    width?: string;
    filter?: FilterConfig;
  }[];
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}

export const DataTableHead = ({ columns, filters, onFilterChange }: DataTableHeadProps) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        {columns.map((column) => (
          <th 
            key={column.key} 
            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width || ''}`}
          >
            <div className="flex flex-col gap-2">
              <span>{column.header}</span>
              {column.filter && (
                <DataTableFilter
                  config={column.filter}
                  value={filters[column.key] || ""}
                  onChange={(value) => onFilterChange(column.key, value)}
                />
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};