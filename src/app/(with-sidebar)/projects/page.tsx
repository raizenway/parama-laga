"use client"
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import ProjectTable from "@/app/components/table/project-table";
import AddButton from "@/app/components/button/add-button";
import ProjectModal from "@/app/components/modal/project-modal";
import { Loader2 } from "lucide-react";
import DeleteConfirmation from "@/app/components/modal/delete-confirmation";

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
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/projects");
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

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const confirmDeleteProject = async () => {
    if (!selectedProject) return;
    
    try {
      const response = await fetch(`/api/projects?id=${selectedProject.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setIsDeleteModalOpen(false);
        fetchProjects(); // Refresh list
      } else {
        console.error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="mx-8 h-screen flex-wrap space-y-5">
      <div className="mt-12 grow">
        <div className="font-poppins font-bold text-2xl">Projects</div>
        <div className="flex justify-end items-center gap-3">
          <Input className="w-72" placeholder="Search" />
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
        title="Delete Project"
        description={`Are you sure you want to delete ${selectedProject?.projectName}? This action cannot be undone.`}
      />
    </div>
  );
}