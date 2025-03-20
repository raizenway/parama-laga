
import TaskForm from "../form/task-form";
import Modal from "./modal";

export default function TaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Task Detail">
      <TaskForm onClose={onClose} />
    </Modal>
  );
}
