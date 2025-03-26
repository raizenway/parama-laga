"use client";

import React, { useState } from "react";
import { User, MoveDown, Users, CreditCard, CalendarCheck2, TrafficCone, Zap, PencilLine, Trash2, Eye } from "lucide-react";
import { Loader2 } from "lucide-react";
import Pagination from "../pagination";

// Definisi tipe data untuk karyawan
type Employee = {
  id: string;
  name: string;
  email: string;
  personnelId: string;
  photoUrl: string | null;
  position: string;
  projects: string[];
  dateAdded: string;
};

type EmployeeTableProps = {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onView: (employee: Employee) => void; // Added view handler
};

export default function EmployeeTable({ employees, isLoading, error, onEdit, onDelete, onView }: EmployeeTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = employees.slice(startIndex, startIndex + itemsPerPage);
  
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
      <table className="w-full border-collapse font-poppins">
        {/* HEADER */}
        <thead className="bg-tersier text-left">
          <tr className="text-black">
            {[
              { icon: <User />, label: "Profile", width: "w-[10%] h-[50px]" },
              { icon: <MoveDown />, label: "Name", width: "w-[15%] h-[50px]" },
              { icon: <Users />, label: "Position", width: "w-[10%] h-[50px]" },
              { icon: <CreditCard />, label: "Employee ID", width: "w-[15%] h-[50px]" },
              { icon: <CalendarCheck2 />, label: "Date Added", width: "w-[15%] h-[50px]" },
              { icon: <TrafficCone />, label: "Projects", width: "w-[25%] h-[50px]" },
              { icon: <Zap />, label: "Act", width: "w-[10%]" },
            ].map(({ icon, label, width }, i) => (
              <th
                key={i}
                className={`px-4 py-2 ${width} ${
                  i === 0 ? "rounded-tl-lg" : ""
                } ${i === 6 ? "rounded-tr-lg" : ""}`}
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
          {employees.length > 0 ? (
            currentEmployees.map((employee) => (
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
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-8">
                Tidak ada data karyawan untuk ditampilkan
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
      totalItems={employees.length}
      />
    </div>
  );
}