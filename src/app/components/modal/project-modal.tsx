import Modal from "./modal";
import ProjectForm from "../form/project-form";

export default function ProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Project Detail">
      <ProjectForm onClose={onClose} />
    </Modal>
  );
}
