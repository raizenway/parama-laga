"use client"
import { User, Mail, BadgeCheck, CalendarDays } from "lucide-react"
import React, { useState, useEffect } from "react"
import Pagination from "../pagination";
import { Loader2 } from "lucide-react";

type Employee = {
  id: number;
  name: string;
  email: string;
  personnelId: string;
  photoUrl: string | null;
  role: string;
  status: string;
};

type ProjectEmployeeTableProps = {
  projectId: string;
  searchTerm?: string;
};

export default function ProjectEmployeeTable({ projectId, searchTerm = "" }: ProjectEmployeeTableProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  useEffect(() => {
    const fetchProjectEmployees = async () => {
      try {
        setIsLoading(true);
        const url = searchTerm 
          ? `/api/projects/${projectId}/employees?search=${encodeURIComponent(searchTerm)}`
          : `/api/projects/${projectId}/employees`;
          
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch project employees: ${response.status}`);
        }
        
        const data = await response.json();
        setEmployees(data);
      } catch (err) {
        console.error("Error fetching project employees:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (projectId) {
      fetchProjectEmployees();
    }
  }, [projectId, searchTerm]);
  
  const paginatedEmployees = employees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  if (isLoading) {
    return (
      <div className="w-full h-32 flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading employees...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div>
      <table className="font-poppins w-full table-auto justify-start">
        <thead className="bg-tersier">
          <tr>
            <th className="px-4 py-2 rounded-tl-lg text-left">
              <div className="flex items-center gap-1">Photo</div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><User /> Employee Name</div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><Mail /> Email</div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><BadgeCheck /> ID</div>
            </th>
            <th className="px-4 py-2 text-left rounded-tr-lg">
              <div className="flex items-center gap-1"><CalendarDays /> Role</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedEmployees.length > 0 ? (
            paginatedEmployees.map((employee) => (
              <tr key={employee.id} className="border-b-2 border-tersier">
                <td className="px-4 py-3 justify-items-center">
                  <div className="flex justify-center">
                    <img 
                      src={employee.photoUrl || "/person.png"} 
                      alt={employee.name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">{employee.name}</td>
                <td className="px-4 py-3">{employee.email}</td>
                <td className="px-4 py-3">{employee.personnelId || '-'}</td>
                <td className="px-4 py-3">{employee.role}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-8">
                No employees assigned to this project
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {employees.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={employees.length}
        />
      )}
    </div>
  )
}