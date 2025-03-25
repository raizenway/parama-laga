"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { X, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Employee = {
  id: string;
  name: string;
  email: string;
  personnelId: string;
  photoUrl: string | null;
  position: string;
  status: string;
  projects: string[];
};

export default function EmployeeAssigning({
  selectedItems,
  setSelectedItems,
  options,
  disabled = false,
  className = ""
}: {
  selectedItems: string[];
  setSelectedItems: (items: string[] | ((prev: string[]) => string[])) => void;
  options?: string[]; // Optional prop to allow passing employee list from parent
  disabled?: boolean; // Add disabled prop for view mode
  className?: string; // Add className prop for styling customization
}) {
  const [employees, setEmployees] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If options are provided from the parent, use those
    if (options && options.length > 0) {
      setEmployees(options);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch from the API
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/employee');
        
        if (response.ok) {
          const data: Employee[] = await response.json();
          // Extract only active employees' names
          const activeEmployeeNames = data
            .filter(emp => emp.status === 'active')
            .map(emp => emp.name);
          setEmployees(activeEmployeeNames);
        } else {
          console.error("Failed to fetch employees");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [options]);

  const toggleSelection = (value: string) => {
    setSelectedItems((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  // If disabled (view mode), render a read-only list of assigned employees
  if (disabled) {
    return (
      <div className={cn("space-y-2", className)}>
        {/* Show a disabled-looking button */}
        <div className="flex items-center justify-between px-3 py-2 border rounded-md bg-gray-50 text-gray-500">
          {selectedItems.length > 0 ? `${selectedItems.length} Employee(s) Assigned` : "No Employees Assigned"}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>

        {/* Show the list of assigned employees in a non-editable format */}
        {selectedItems.length > 0 && (
          <div className="border border-gray-300 rounded-md p-3 space-y-1 bg-gray-50">
            {selectedItems.map((item) => (
              <div key={item} className="flex items-center px-3 py-1 rounded-md">
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Interactive version for add/edit modes
  return (
    <div className={cn("space-y-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading employees...
              </>
            ) : (
              selectedItems.length > 0 ? `${selectedItems.length} Assigned` : "Assign Employee"
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-popper-anchor-width)]">
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            employees.length > 0 ? (
              employees.map((employee) => (
                <DropdownMenuCheckboxItem
                  key={employee}
                  checked={selectedItems.includes(employee)}
                  onCheckedChange={() => toggleSelection(employee)}
                >
                  {employee}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <div className="p-2 text-center text-sm text-gray-500">
                No employees found
              </div>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedItems.length > 0 && (
        <div className="border border-gray-300 rounded-md p-3 space-y-1">
          {selectedItems.map((item) => (
            <div key={item} className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded-md">
              <span>{item}</span>
              <button
                onClick={() => setSelectedItems(selectedItems.filter((i) => i !== item))}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}