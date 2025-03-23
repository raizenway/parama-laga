"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { X, Loader2 } from "lucide-react";

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
  options
}: {
  selectedItems: string[];
  setSelectedItems: (items: string[] | ((prev: string[]) => string[])) => void;
  options?: string[]; // Optional prop to allow passing employee list from parent
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

  return (
    <div className="space-y-2">
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