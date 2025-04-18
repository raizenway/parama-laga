"use client"
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import TaskTable from "@/app/components/table/task-table";
import EmployeeTable from "@/app/components/table/project-employee-table";
import { Loader2, ArrowLeft, Building2, CreditCard, CalendarDays, User, CalendarCheck2, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function ProjectDetailPage() {
  const { id } = useParams() ?? {};
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        if (!id) return;
        const projectId = id;
        const response = await fetch(`/api/projects/${projectId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch project data: ${response.status}`);
        }
        
        const data = await response.json();
        setProject(data);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading project data...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error || "Project not found"}</p>
        <Button onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Back to Projects
        </Button>
      </div>
    );
  }

  // Get the status color based on the status name
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h1 className=" font-bold text-2xl">Project Details</h1>
        <Button onClick={handleBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Back
        </Button>
      </div>
      
      {/* Project details section */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="">
            <div className="flex flex-wrap md:flex-nowrap gap-8">
              <div className="flex flex-col grow space-y-5 w-full">
                {/* PROJECT IDENTITY */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="relative space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 size={18} />
                      <label className="text-sm font-medium">Project Name</label>
                    </div>
                    <Input value={project.projectName} readOnly className="bg-gray-50" />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium absolute right-2 top-6 ${getStatusColor(project.status.statusName)}`}>
                          {project.status.statusName}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User size={18} />
                      <label className="text-sm font-medium">Project Owner</label>
                    </div>
                    <Input value={project.projectOwner} readOnly className="bg-gray-50" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CreditCard size={18} />
                      <label className="text-sm font-medium">Project Code</label>
                    </div>
                    <Input value={project.projectCode} readOnly className="bg-gray-50" />
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarCheck2 size={18} />
                          <label className="text-sm font-medium">Start Date</label>
                        </div>
                        <Input 
                          value={new Date(project.startDate).toLocaleDateString('en-US', {
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric'
                          })} 
                          readOnly 
                          className="bg-gray-50" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarClock size={18} />
                          <label className="text-sm font-medium">End Date</label>
                        </div>
                        <Input 
                          value={new Date(project.endDate).toLocaleDateString('en-US', {
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric'
                          })} 
                          readOnly 
                          className="bg-gray-50" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* PROJECT EMPLOYEES */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <User size={20} />
          Assigned Employees
        </h2>
        {/* Employee Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6">
            <EmployeeTable projectId={project.id} />
          </div>
        </div>
      </div>
    
      {/* PROJECT TASKS */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CalendarDays size={20} />
          Project Tasks
        </h2>
        {/* Task Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6">
            <TaskTable projectId={project.id} />
          </div>
        </div>
      </div>
    </div>
  );
}