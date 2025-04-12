"use client";

import React, { useState, useMemo } from "react";
import { User, CircleArrowRight, MoveDown, Users, CreditCard, CalendarCheck2, TrafficCone, Zap, PencilLine, Trash2, Eye, Shield } from "lucide-react";
import { Loader2 } from "lucide-react";
import Pagination from "../pagination";
import { useRouter } from "next/navigation";
import TableFilter from "@/app/components/function/filter-table";

type Employee = {
  id: string;
  name: string;
  email: string;
  personnelId: string;
  photoUrl: string | null;
  position: string;
  projects: string[];
  dateAdded: string;
  status: string;
  role: string;
  roleAccess: string;
};

type EmployeeTableProps = {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onView: (employee: Employee) => void;
};

export default function EmployeeTable({ employees, isLoading, error, onEdit, onDelete, onView }: EmployeeTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();
  
  // State untuk filter
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    project: ""
  });

  // Generate role options for filter
  const roleOptions = useMemo(() => {
    const uniqueRoles = [...new Set(employees.map(e => e.role))];
    return [
      ...uniqueRoles.map(role => ({ value: role, label: role }))
    ];
  }, [employees]);

  // Generate status options for filter
  const statusOptions = useMemo(() => {
    return [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" }
    ];
  }, []);

  // Generate project options for filter
  const projectOptions = useMemo(() => {
    const projectSet = new Set<string>();
    employees.forEach(employee => {
      if (employee.projects && employee.projects.length > 0) {
        employee.projects.forEach(project => projectSet.add(project));
      }
    });
    
    return [
      ...[...projectSet].map(project => ({ value: project, label: project }))
    ];
  }, [employees]);

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
  };

  // Filter employees based on filters
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // Filter by role
      const matchesRole = filters.role === "" || 
        employee.role === filters.role;
      
      // Filter by status
      const matchesStatus = filters.status === "" || 
        employee.status === filters.status;
      
      // Filter by project
      const matchesProject = filters.project === "" || 
        (employee.projects && employee.projects.some(project => project === filters.project));
      
      return matchesRole && matchesStatus && matchesProject;
    });
  }, [employees, filters]);

  // Paginated employees
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Memuat data karyawan...</span>
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
    <div className="overflow-x-auto">
      {/* Filter section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <TableFilter
              column="role"
              options={roleOptions}
              selectedValue={filters.role}
              onFilterChange={handleFilterChange}
              placeholder="Filter by role"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <TableFilter
              column="status"
              options={statusOptions}
              selectedValue={filters.status}
              onFilterChange={handleFilterChange}
              placeholder="Filter by status"
            />
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <TableFilter
              column="project"
              options={projectOptions}
              selectedValue={filters.project}
              onFilterChange={handleFilterChange}
              placeholder="Filter by project"
            />
          </div>
        </div>
      </div>

      <table className="w-full border-collapse ">
        {/* HEADER */}
        <thead className="bg-tersier text-left">
          <tr className="text-black">
            {[
              { icon: <User />, label: "Profile", width: "w-[8%] h-[50px]" },
              { icon: <MoveDown />, label: "Name", width: "w-[15%] h-[50px]" },
              { icon: <Users />, label: "Position", width: "w-[10%] h-[50px]" },
              { icon: <CreditCard />, label: "Employee ID", width: "w-[10%] h-[50px]" },
              { icon: <Shield />, label: "Status", width: "w-[10%] h-[50px]" }, // New status column
              { icon: <CalendarCheck2 />, label: "Date Added", width: "w-[12%] h-[50px]" },
              { icon: <TrafficCone />, label: "Projects", width: "w-[25%] h-[50px]" },
              { icon: <Zap />, label: "Act", width: "w-[10%]" },
            ].map(({ icon, label, width }, i) => (
              <th
                key={i}
                className={`px-4 py-2 ${width} ${
                  i === 0 ? "rounded-tl-lg" : ""
                } ${i === 7 ? "rounded-tr-lg" : ""}`}
              >
                <div className="flex items-center gap-1">
                  {icon} {label}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {filteredEmployees.length > 0 ? (
            paginatedEmployees.map((employee) => (
              <tr key={employee.id} className="border-b border-tersier">
                <td className="px-4 py-3">
                  <div className="h-10 w-10 bg-green-300 rounded-full mx-auto overflow-hidden">
                    {employee.photoUrl ? (
                      <img src={employee.photoUrl} alt={employee.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-blue-200 text-blue-800 font-bold">
                        {employee.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">{employee.name}</td>
                <td className="px-4 py-3">{employee.role}</td>
                <td className="px-4 py-3">{employee.personnelId}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    employee.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {employee.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">{new Date(employee.dateAdded).toLocaleDateString()}</td>
                <td className="px-4 py-3">{employee.projects && employee.projects.length > 0 ? employee.projects.join(', ') : '-'}</td>
                <td className="px-4 py-3 flex justify-center gap-3">
                  <button 
                    onClick={() => onEdit(employee)} 
                    className="text-green-600 hover:text-green-700"
                    title="Edit employee"
                  >
                    <PencilLine />
                  </button>
                  <button 
                    onClick={() => onDelete(employee)} 
                    className="text-red-500 hover:text-red-700"
                    title="Delete employee"
                  >
                    <Trash2 />
                  </button>
                  <button 
                    onClick={() => onView(employee)} 
                    className="text-slate-800 hover:text-slate-950"
                    title="View employee details"
                  >
                    <Eye />
                  </button>
                  <button 
                    onClick={() => router.push(`/employees/detail-employee/${employee.id}`)} 
                    className="text-blue-600 hover:text-blue-700"
                    title="Go to employee details page"
                  >
                    <CircleArrowRight />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-8">
                {Object.values(filters).some(f => f !== "") 
                  ? "Tidak ada karyawan yang cocok dengan filter yang dipilih" 
                  : "Tidak ada data karyawan untuk ditampilkan"}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        totalItems={filteredEmployees.length}
      />
    </div>
  );
} 