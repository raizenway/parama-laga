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
  mode?: "add" | "edit";
  onProjectChange?: () => void;
}) {
  const title = mode === "add" ? "Add Project" : "Edit Project";

  // For debugging - log when project prop changes
  useEffect(() => {
    if (open && project) {
      console.log("Modal opened with project data:", project);
    }
  }, [open, project]);

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <ProjectForm 
        onClose={onClose} 
        project={project} 
        mode={mode} 
        onSuccess={onProjectChange}
      />
    </Modal>
  );
}