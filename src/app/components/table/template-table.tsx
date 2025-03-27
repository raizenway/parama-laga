"use client";

import { useDebounce } from "@/hooks/useDebounce";  
import { CalendarCheck2, MoveDown, PencilLine, Trash2, Eye, FileText, ListCheck, Zap } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Pagination from "../pagination";

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
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearchQuery = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const paginatedTemplates = filteredTemplates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  
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
        setFilteredTemplates(data);
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
      <table className="font-poppins w-full table-auto justify-start">
        <thead className="bg-tersier">
        <tr className="text-black">
            {[
              { icon: <FileText />, label: "Template Name", width: "w-[55%] h-[50px]" },
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
                <td className="px-4 py-3 flex gap-5 justify-center">
                  <button onClick={() => onEdit(template)} title="Edit template">
                    <PencilLine className="text-green-600 hover:text-green-700"/>
                  </button>
                  <button onClick={() => onDelete(template)} title="Delete template">
                    <Trash2 className="text-red-500 hover:text-red-700"/>
                  </button>
                  <button onClick={() => onView(template)} title="View template details">
                    <Eye className="text-slate-800 hover:text-slate-950"/>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center py-8">
                {searchTerm ? 'No templates match your search' : 'No templates available'}
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