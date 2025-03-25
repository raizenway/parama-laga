import ProjectForm from "@/app/components/form/project-form";
import Modal from "./modal";
import { useEffect } from "react";

export default function ProjectModal({ 
  open, 
  onClose, 
  project = null,
  mode = "add",
  onProjectChange // New prop for refreshing the list
}: { 
  open: boolean; 
  onClose: () => void; 
  project?: any; 
  mode?: "add" | "edit" | "view";
  onProjectChange?: () => void;
}) {
  const title = mode === "add" ? "Add New Project" : 
               mode === "edit" ? "Edit Project" : "View Project";

  return (
    <Modal 
      closeType="cross" 
      open={open} 
      onClose={onClose} 
      title={title}
    >
      <ProjectForm 
        onClose={onClose} 
        project={project} 
        mode={mode}
        onSuccess={onProjectChange} 
      />
    </Modal>
  );
}