import { CalendarCheck2, CalendarClock, CreditCard,TrafficCone } from "lucide-react"
import React, { useEffect, useState } from "react"
import Pagination from "../pagination";
import { Loader2 } from "lucide-react";

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
};

type ProjectAssignedTableProps = {
  employeeId: string;
};

export default function ProjectAssignedTable({ employeeId }: ProjectAssignedTableProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  useEffect(() => {
    const fetchEmployeeProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/employee/${employeeId}/projects`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch employee projects: ${response.status}`);
        }
        
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching employee projects:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (employeeId) {
      fetchEmployeeProjects();
    }
  }, [employeeId]);
  
  const paginatedProjects = projects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  if (isLoading) {
    return (
      <div className="w-full h-32 flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div>
      <table className=" w-full table-auto justify-start">
        <thead className="bg-tersier">
          <tr>
            <th className="px-4 py-2 rounded-tl-lg text-left">
              <div className="flex items-center gap-1"><TrafficCone /> Project</div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><CreditCard /> ID Project </div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><CalendarCheck2 /> Start Date </div>
            </th>
            <th className="px-4 py-2 text-left rounded-tr-lg">
              <div className="flex items-center gap-1"><CalendarClock /> Due Date </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedProjects.length > 0 ? (
            paginatedProjects.map((project) => (
              <tr key={project.id} className="border-b-2 border-tersier">
                <td className="px-4 py-3">{project.projectName}</td>
                <td className="px-4 py-3">{project.projectCode}</td>
                <td className="px-4 py-3">{new Date(project.startDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">{new Date(project.endDate).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-8">
                No projects assigned to this employee
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Only show pagination if there are projects and more than one page */}
      {projects.length > 0 && (
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={projects.length}
        />
      )}
    </div>
  )
}