import EmployeeForm from "@/app/components/form/employee-form";
import Modal from "./modal";

export default function EmployeeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Employee Detail">
      <EmployeeForm onClose={onClose} />
    </Modal>
  );
}
