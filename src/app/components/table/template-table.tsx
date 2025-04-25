"use client";

import { useDebounce } from "@/hooks/useDebounce";  
import { CalendarCheck2, PencilLine, Trash2, Eye, FileCheck2, ListCheck, Zap } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Pagination from "../pagination";
// import TableFilter from "../function/filter-table";
import { DateMonthYearFilter } from "../function/date-month-year-filter";

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
    templateName: "",
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
  
  // const dateAddedOptions = useMemo(() => {
  //   const now = new Date();
  //   const thisMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
  //   const lastMonth = new Date(now);
  //   lastMonth.setMonth(now.getMonth() - 1);
  //   const lastMonthStr = `${lastMonth.getFullYear()}-${(lastMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    
  //   const thisYear = now.getFullYear().toString();
    
  //   return [
  //     { value: "", label: "All time" },
  //     { value: thisMonth, label: "This month" },
  //     { value: lastMonthStr, label: "Last month" },
  //     { value: thisYear, label: "This year" }
  //   ];
  // }, []);

  // Filter templates based on criteria
  const filteredTemplates = useMemo(() => {
    function normalizeDate(date: Date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
  
    return templates.filter(template => {
      const matchesProjectName =
        filters.templateName === "" ||
        template.templateName.toLowerCase().includes(filters.templateName.toLowerCase());
  
      const matchesDateAdded =
        filters.dateAdded === "" ||
        normalizeDate(new Date(template.createdAt)).getTime() ===
        normalizeDate(new Date(filters.dateAdded)).getTime();
  
      return matchesProjectName && matchesDateAdded;
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
          {/* Project Name Filter */}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ">Template Name</label>
            <input
              type="text"
              placeholder="Search by name..."
              className="px-2 py-2 border rounded-md text-sm w-full"
              value={filters.templateName}
              onChange={(e) => handleFilterChange("templateName", e.target.value)}
            />
          </div>

          {/* Date Added Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Added</label>
            <DateMonthYearFilter
              value={filters.dateAdded}
              onChange={(value) => setFilters(prev => ({ ...prev, dateAdded: value }))}
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