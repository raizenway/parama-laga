"use client";

import { useDebounce } from "@/hooks/useDebounce";  
import { CalendarCheck2, MoveDown, PencilLine, Trash2, Eye, FileCheck2, ListCheck, Zap } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Pagination from "../pagination";
import TableFilter from "../function/filter-table";

type Template = {
  id: number;
  templateName: string;
  createdAt: string;
  updatedAt: string;
  templateChecklists: {
    id: number;
    templateId: number;
    checklistId: number;
    checklist: {
      id: number;
      criteria: string;
    }
  }[];
};

type TemplateTableProps = {
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onView: (template: Template) => void;
  searchTerm?: string;
};

export default function TemplateTable({ onEdit, onDelete, onView, searchTerm = "" }: TemplateTableProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearchQuery = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // State untuk filter
  const [filters, setFilters] = useState({
    checklistCount: "",
    dateAdded: "",
  });
  
  // Fetch templates
  const fetchTemplates = async (query="") => {
    setIsLoading(true);
    try {
      const url = query ? `/api/templates?search=${encodeURIComponent(query)}` : "/api/templates";
      const response = await fetch(url);        
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }
      
      const data = await response.json();
      setTemplates(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError("Failed to load templates");
      toast.error("Error", {
        description: "Failed to load templates. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter templates based on search term
  useEffect(() => {
    fetchTemplates(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  // Generate filter options
  const checklistCountOptions = useMemo(() => {
    return [
      { value: "", label: "All" },
      { value: "0", label: "No checklists" },
      { value: "1-5", label: "1-5 checklists" },
      { value: "6-10", label: "6-10 checklists" },
      { value: "10+", label: "10+ checklists" }
    ];
  }, []);
  
  const dateAddedOptions = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${(lastMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const thisYear = now.getFullYear().toString();
    
    return [
      { value: "", label: "All time" },
      { value: thisMonth, label: "This month" },
      { value: lastMonthStr, label: "Last month" },
      { value: thisYear, label: "This year" }
    ];
  }, []);

  // Filter templates based on criteria
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // Filter by checklist count
      let matchesChecklistCount = true;
      const count = template.templateChecklists.length;
      
      if (filters.checklistCount === "0") {
        matchesChecklistCount = count === 0;
      } else if (filters.checklistCount === "1-5") {
        matchesChecklistCount = count >= 1 && count <= 5;
      } else if (filters.checklistCount === "6-10") {
        matchesChecklistCount = count >= 6 && count <= 10;
      } else if (filters.checklistCount === "10+") {
        matchesChecklistCount = count > 10;
      }
      
      // Filter by date added
      let matchesDate = true;
      if (filters.dateAdded) {
        const templateDate = new Date(template.createdAt);
        
        if (filters.dateAdded.includes('-')) {
          // Month filter (YYYY-MM)
          const [year, month] = filters.dateAdded.split('-').map(Number);
          matchesDate = templateDate.getFullYear() === year && 
                        templateDate.getMonth() + 1 === month;
        } else {
          // Year filter (YYYY)
          matchesDate = templateDate.getFullYear() === parseInt(filters.dateAdded);
        }
      }
      
      return matchesChecklistCount && matchesDate;
    });
  }, [templates, filters]);

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
  };

  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading templates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Checklist Count Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Checklist Count</label>
            <TableFilter
              column="checklistCount"
              options={checklistCountOptions}
              selectedValue={filters.checklistCount}
              onFilterChange={handleFilterChange}
              placeholder="Filter by checklist count"
            />
          </div>

          {/* Date Added Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Added</label>
            <TableFilter
              column="dateAdded"
              options={dateAddedOptions}
              selectedValue={filters.dateAdded}
              onFilterChange={handleFilterChange}
              placeholder="Filter by date"
            />
          </div>
        </div>
      </div>
      
      <table className=" w-full table-auto justify-start">
        <thead className="bg-tersier">
          <tr className="text-black">
            {[
              { icon: <FileCheck2 />, label: "Template Name", width: "w-[55%] h-[50px]" },
              { icon: <CalendarCheck2 />, label: "Date Added", width: "w-[15%] h-[50px]" },
              { icon: <ListCheck />, label: "Checklist", width: "w-[5%] h-[50px]" },
              { icon: <Zap />, label: "Actions", width: "w-[25%]", center: true},
            ].map(({ icon, label, width, center }, i) => (
              <th
                key={i}
                className={`px-4 py-2 ${width} ${
                  i === 0 ? "rounded-tl-lg" : ""
                } ${i === 3 ? "rounded-tr-lg" : ""}`}
              >
                <div className={`flex items-center gap-1 ${center ? "justify-center" : ""}`}>
                  {icon} {label}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedTemplates.length > 0 ? (
            paginatedTemplates.map((template) => (
              <tr key={template.id} className="border-b-2 border-tersier">
                <td className="px-4 py-3">{template.templateName}</td>
                <td className="px-4 py-3">
                  {template.createdAt ? format(new Date(template.createdAt), 'dd MMM yyyy') : 'N/A'}
                </td>
                <td className="px-4 py-3 text-center">
                  {template.templateChecklists.length}
                </td>
                <td className="px-4 py-3 flex justify-center gap-3">
                  <button onClick={() => onEdit(template)} className="text-green-600 hover:text-green-700">
                    <PencilLine />
                  </button>
                  <button onClick={() => onDelete(template)} className="text-red-500 hover:text-red-700">
                    <Trash2 />
                  </button>
                  <button onClick={() => onView(template)} className="text-slate-800 hover:text-slate-950">
                    <Eye />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center py-8">
                {Object.values(filters).some(f => f !== "") || searchTerm
                  ? "No templates match your search/filter criteria"
                  : "No templates available"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      <Pagination
        totalItems={filteredTemplates.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>    
  );
}   