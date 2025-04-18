
import TaskForm from "../form/task-form";
import Modal from "./modal";

export default function TaskModal({ open, onClose,onTaskSaved }: { open: boolean; onClose: () => void ;onTaskSaved?: () => void;}) {
  return (
    <Modal open={open} closeType="cross" onClose={onClose} title="Task Detail">
      <TaskForm onClose={onClose} onSuccess={onTaskSaved} />
    </Modal>
  );
}
