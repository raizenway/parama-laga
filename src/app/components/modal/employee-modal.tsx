import EmployeeForm from "@/app/components/form/employee-form";
import Modal from "./modal";
import { useEffect } from "react";

export default function EmployeeModal({ 
  open, 
  onClose, 
  employee = null,
  mode = "add",
  onEmployeeChange // New prop
}: { 
  open: boolean; 
  onClose: () => void; 
  employee?: any; 
  mode?: "add" | "edit";
  onEmployeeChange?: () => void; // Add type for the new prop
}) {
  const title = mode === "add" ? "Add Employee" : "Edit Employee";

  // For debugging - log when employee prop changes
  useEffect(() => {
    if (open && employee) {
      console.log("Modal opened with employee data:", employee);
    }
  }, [open, employee]);

return (
  <Modal closeType="cross" open={open} onClose={onClose} title={title} size="lg">
    <EmployeeForm 
      onClose={onClose} 
      employee={employee} 
      mode={mode} 
      onSuccess={onEmployeeChange} // Pass the callback to EmployeeForm
    />
  </Modal>
);
}