"use client";
import { Input } from "@/components/ui/input";
import EmployeeModal from "@/app/components/modal/employee-modal";
import DeleteConfirmation from "@/app/components/modal/delete-confirmation";
import { useState, useEffect } from "react";
import AddButton from "@/app/components/button/button";
import EmployeeTable from "@/app/components/table/employee-table";

// Tipe data untuk karyawan
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

export default function Page() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/employee');

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Gagal memuat data karyawan");
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmployees(employees);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(lowerCaseSearch) ||
        employee.personnelId.toLowerCase().includes(lowerCaseSearch) ||
        employee.position.toLowerCase().includes(lowerCaseSearch) ||
        (employee.projects.some(project => 
          project.toLowerCase().includes(lowerCaseSearch)
        ))
    );

    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle edit button click
  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalMode("edit");
    setIsDetailOpen(true);
  };

  // Handle delete button click
  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteOpen(true);
  };

  // Handle add button click
  const handleAdd = () => {
    setSelectedEmployee(null);
    setModalMode("add");
    setIsDetailOpen(true);
  };

  const handleEmployeeChange = () => {
    // Refresh employee list
    fetchEmployees();
  };

// Handle delete confirmation
const handleConfirmDelete = async () => {
  if (!selectedEmployee) return;

  try {
    console.log("Deleting employee:", selectedEmployee.id);
    const response = await fetch(`/api/employee?id=${selectedEmployee.id}`, {
      method: 'DELETE',
    });
    
    // Log status dan response untuk debugging
    console.log("Delete response status:", response.status);
    
    if (response.ok) {
      // Response parseable sebagai JSON
      const data = await response.json().catch(() => ({ message: "Success but no JSON returned" }));
      console.log("Delete successful:", data);
      fetchEmployees();
      setIsDeleteOpen(false);
    } else {
      // Error response
      let errorMessage = "Failed to delete employee";
      try {
        const errorData = await response.json();
        console.error("Delete failed:", errorData);
        errorMessage = errorData.message || "Unknown error";
        
        // Log detail error jika ada
        if (errorData.details) {
          console.error("Error details:", errorData.details);
        }
        if (errorData.constraints) {
          console.error("Constraint details:", errorData.constraints);
        }
      } catch (jsonError) {
        console.error("Error parsing error response:", jsonError);
      }
      alert(`Failed to delete employee: ${errorMessage}`);
    }
  } catch (error) {
    console.error("Network or fetch error:", error);
    alert("An error occurred while trying to delete the employee");
  }
};
  return (
    <div className="mx-8 h-screen flex-wrap space-y-5">
      {/* Baris 2 */}
      <div className="mt-12 grow">
        <div className="font-poppins font-bold text-2xl">Employees</div>
          <div className="flex justify-end items-center gap-3">
            <Input 
              className="w-72" 
              type="text" 
              placeholder="Search" 
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <AddButton text="+ Add Employee" onClick={handleAdd} />
          </div>

          <div className="grow h-96 bg-white rounded-2xl flex justify-center items-start p-4">
            <div className="max-h-full w-full">
              <EmployeeTable 
                employees={filteredEmployees} 
                isLoading={isLoading} 
                error={error}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>

      {/* Employee Modal */}
      <EmployeeModal 
        open={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        employee={selectedEmployee}
        mode={modalMode}
        onEmployeeChange={handleEmployeeChange} // Add this new prop
      />

      {/* Delete Confirmation */}
      {selectedEmployee && (
        <DeleteConfirmation 
          open={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          name={selectedEmployee.name}
        />
      )}
    </div>
  );
}