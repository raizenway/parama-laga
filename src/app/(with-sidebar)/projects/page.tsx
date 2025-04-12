"use client"
import { useDebounce } from "@/hooks/useDebounce";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import ProjectTable from "@/app/components/table/project-table";
// import AddButton from "@/app/components/button/add-button";
import AddButton from "@/app/components/button/button-custom";
import ProjectModal from "@/app/components/modal/project-modal";
import { Loader2 } from "lucide-react";
import DeleteConfirmation from "@/app/components/modal/delete-confirmation";
import { toast } from "sonner"; // Make sure to import toast

// Define project type
type Project = {
  id: string;
  projectName: string;
  projectCode: string;
  projectOwner: string;
  startDate: string;
  endDate: string;
  status: {
    statusName: string;
  };
  employees: string[];
};

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  // Fetch projects
  const fetchProjects = async (query="") => {
    setIsLoading(true);
    try {
      const url = query ? `/api/projects?search=${encodeURIComponent(query)}` : "/api/projects";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Error fetching projects. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch when search query changes
  useEffect(() => {
    fetchProjects(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const handleAddProject = () => {
    setSelectedProject(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setModalMode("view");
    setIsModalOpen(true);
  };  

  const confirmDeleteProject = async () => {
    if (!selectedProject) return;
    setDeleteLoading(true);
    
    try {
      const response = await fetch(`/api/projects?id=${selectedProject.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        // Show success toast notification
        toast.success("Project Berhasil Dihapus", {
          description: `Project "${selectedProject.projectName}" telah berhasil dihapus dari sistem.`
        });
        
        setIsDeleteModalOpen(false);
        fetchProjects(); // Refresh list
      } else {
        // Parse error response
        let errorMessage = "Gagal menghapus project";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response can't be parsed as JSON
        }
        
        // Show error toast notification
        toast.error("Gagal Menghapus Project", {
          description: errorMessage
        });
        console.error("Failed to delete project:", errorMessage);
      }
    } catch (error) {
      // Show error toast notification for network/unexpected errors
      toast.error("Error", {
        description: "Terjadi kesalahan saat menghapus project. Silahkan coba lagi nanti."
      });
      console.error("Error deleting project:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mx-8 h-screen flex-wrap space-y-5">
      <div className="mt-12 grow">
        <div className=" font-bold text-2xl">Projects</div>
        <div className="flex justify-end items-center gap-3">
          <AddButton text="+ Add Project" onClick={handleAddProject} />
        </div>
        <div className="grow h-96 bg-white rounded-2xl flex justify-center items-start p-4">
          <div className="max-h-full w-full">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading projects...</span>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
              <ProjectTable 
                projects={projects}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onView={handleViewProject}
              />
            )}
          </div>
        </div>
      </div>
      
      <ProjectModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        project={selectedProject}
        mode={modalMode}
        onProjectChange={fetchProjects}
      />
      
      <DeleteConfirmation
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteProject}
        name={selectedProject?.projectName || ""}
        entityType="project"
        description={`Tindakan ini tidak dapat dibatalkan. Semua tasks dan progress terkait project ini juga akan dihapus.`}
        isLoading={deleteLoading}
      />
    </div>
  );
}