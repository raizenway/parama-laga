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
  mode?: "add" | "edit" | "view";
  onEmployeeChange?: () => void; // Add type for the new prop
}) {
  const title = mode === "add" ? "Add Employee" : 
                mode === "edit" ? "Edit Employee" : "View Employee";

  const handleClose = () => {
    // Call the onClose function passed from parent
    onClose();
  };

  // For debugging - log when employee prop changes
  useEffect(() => {
    if (open && employee) {
      console.log("Modal opened with employee data:", employee);
    }
  }, [open, employee]);

  return (
    <Modal closeType="cross" open={open} onClose={handleClose} title={title} size="lg">
      <EmployeeForm 
        onClose={handleClose} 
        employee={employee} 
        mode={mode} 
        onSuccess={onEmployeeChange}
      />
    </Modal>
  );
}