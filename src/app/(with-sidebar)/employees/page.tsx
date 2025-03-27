"use client";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import EmployeeModal from "@/app/components/modal/employee-modal";
import DeleteConfirmation from "@/app/components/modal/delete-confirmation";
import { useState, useEffect } from "react";
import AddButton from "@/app/components/button/button-custom";
import EmployeeTable from "@/app/components/table/employee-table";
import { toast } from "sonner";

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
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);


  const closeEmployeeModal = () => {
    setIsDetailOpen(false);
    // Reset the selectedEmployee when closing the modal
    setSelectedEmployee(null);
  };

  const fetchEmployees = async (query="") => {
    setIsLoading(true);
    try {
      const url = query ?`/api/employee?search=${encodeURIComponent(query)}` : "/api/employee";
      const response = await fetch(url);

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
    fetchEmployees(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

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
      setSearchQuery(e.target.value);
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

    
  // Handle view button click
  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalMode("view");
    setIsDetailOpen(true);
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
  
  // Update your handleDeleteConfirm function
  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return;
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/employee?id=${selectedEmployee.id}`, {
        method: 'DELETE',
      });
      
      // console.log("Delete response status:", response.status);
      
      if (response.ok) {
        const data = await response.json().catch(() => ({ message: "Success but no JSON returned" }));
        // console.log("Delete successful:", data);
        
        // Add success toast notification
        toast.success(`Employee Deleted`, {
          description: `${selectedEmployee.name} has been successfully removed from the system.`
        });
        
        fetchEmployees();
        setIsDeleteOpen(false);
      } else {
        // Error handling
        let errorMessage = "Failed to delete employee";
        try {
          const errorData = await response.json();
          console.error("Delete failed:", errorData);
          errorMessage = errorData.message || "Unknown error";
          
          // Add error toast notification
          toast.error(`Delete Failed`, {
            description: errorMessage
          });
          
          if (errorData.details) {
            console.error("Error details:", errorData.details);
          }
          if (errorData.constraints) {
            console.error("Constraint details:", errorData.constraints);
          }
        } catch (jsonError) {
          console.error("Error parsing JSON response:", jsonError);
          toast.error(`Delete Failed`, {
            description: "An unexpected error occurred"
          });
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error(`Network Error`, {
        description: "Could not connect to the server"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mx-8 h-screen flex-wrap space-y-5">
      <div className="mt-12 grow">
        <div className="font-poppins font-bold text-2xl">Employees</div>
        <div className="flex justify-end items-center gap-3">
          <Input 
            className="w-72" 
            type="text" 
            placeholder="Search employee name..."
            value={searchQuery} 
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
              onView={handleView} // Add view handler
            />
          </div>
        </div>
      </div>

      {/* Employee Modal */}
      <EmployeeModal 
        open={isDetailOpen} 
        onClose={closeEmployeeModal} 
        employee={selectedEmployee}
        mode={modalMode}
        onEmployeeChange={handleEmployeeChange}
      />
      
      {/* Delete Confirmation */}
      {selectedEmployee && (
        <DeleteConfirmation 
          open={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          name={selectedEmployee.name}
          isLoading={deleteLoading}
        />
      )}
    </div>
  );
}