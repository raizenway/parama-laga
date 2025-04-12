"use client"
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface TableFilterProps {
  column: string;
  options: {
    value: string;
    label: string;
  }[];
  selectedValue: string;
  onFilterChange: (column: string, value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
}

const TableFilter = ({
  column,
  options,
  selectedValue,
  onFilterChange,
  icon,
  placeholder = "Select filter",
}: TableFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (value: string) => {
    onFilterChange(column, value);
    setIsOpen(false);
  };

  const clearFilter = () => {
    onFilterChange(column, "");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left w-full rounded border" ref={dropdownRef}>
      <div
        className="flex items-center cursor-pointer justify-between hover:bg-gray-100 text-sm px-2 py-1 rounded w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon}
        <span className={`whitespace-nowrap ${!selectedValue ? "text-gray-400" :""}`}>
          {selectedValue
            ? options.find((opt) => opt.value === selectedValue)?.label
            : placeholder}
        </span>
        {selectedValue ? (
          <X
            size={16}
            onClick={(e) => {
              e.stopPropagation();
              clearFilter();
            }}
            className="text-red-500 hover:text-gray-700"
          />
        ) : isOpen ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )}
      </div>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1 max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={`block px-4 py-2 text-sm cursor-pointer ${
                  selectedValue === option.value
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableFilter;