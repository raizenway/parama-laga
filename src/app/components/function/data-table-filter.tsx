// components/table/DataTableFilter.tsx
"use client"
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import { FilterConfig } from "@/app/types/filter"

interface DataTableFilterProps {
  config: FilterConfig;
  value: string;
  onChange: (value: string) => void;
}

export const DataTableFilter = ({ config, value, onChange }: DataTableFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    onChange(value);
    setIsOpen(false);
  };

  const clearFilter = () => {
    onChange("");
  };

  if (config.type === 'text') {
    return (
      <div className="relative flex items-center">
        {config.icon && (
          <span className="absolute left-3 text-gray-400">
            {config.icon}
          </span>
        )}
        <input
          type="text"
          placeholder={config.placeholder}
          className={`pl-10 pr-4 py-2 border rounded-lg text-sm ${config.icon ? 'pl-10' : 'pl-3'}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            onClick={clearFilter}
            className="absolute right-3 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  if (config.type === 'select') {
    return (
      <div className="relative inline-block text-left">
        <div
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg border"
          onClick={() => setIsOpen(!isOpen)}
        >
          {config.icon}
          <span className="text-sm">
            {value
              ? config.options?.find(opt => opt.value === value)?.label
              : config.placeholder}
          </span>
          {value ? (
            <X
              size={16}
              onClick={(e) => {
                e.stopPropagation();
                clearFilter();
              }}
              className="text-gray-500 hover:text-gray-700"
            />
          ) : isOpen ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </div>
        
        {isOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1 max-h-60 overflow-auto">
              {config.options?.map((option) => (
                <div
                  key={option.value}
                  className={`block px-4 py-2 text-sm cursor-pointer ${
                    value === option.value
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
  }

  // Untuk tipe filter lainnya (date, dll)
  return null;
};