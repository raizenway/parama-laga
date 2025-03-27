import { Building2, CalendarCheck2, CalendarClock, CreditCard, Eye, MoveDown, PencilLine, Trash2, Zap } from "lucide-react"
import { useState } from "react";
import Pagination from "../pagination";

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

type ProjectTableProps = {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onView: (project: Project) => void; // Add onView prop
};

export default function ProjectTable({ projects, onEdit, onDelete, onView }: ProjectTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const paginatedProjects = projects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  return (
    <div>
      <table className="font-poppins w-full table-auto justify-start">
        <thead className="bg-tersier">
          <tr>
            <th className="px-4 py-2 rounded-tl-lg text-left">
              <div className="flex items-center gap-1">Logo</div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><MoveDown /> Project</div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><Building2 /> Company </div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><CreditCard /> ID Project </div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><CalendarCheck2 /> Start Date </div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><CalendarClock /> End Date </div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1">Status</div>
            </th>
            <th className="px-4 py-2 rounded-tr-lg text-center">
              <div className="flex items-center justify-center">Actions</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedProjects.length > 0 ? (
            paginatedProjects.map((project) => (
              <tr key={project.id} className="border-b-2 border-tersier">
                <td className="px-4 py-3 justify-items-center">
                  <div className="justify-center h-10 w-10 bg-green-300 rounded-full"></div>
                </td>
                <td className="px-4 py-3">{project.projectName}</td>
                <td className="px-4 py-3">{project.projectOwner}</td>
                <td className="px-4 py-3">{project.projectCode}</td>
                <td className="px-4 py-3">{new Date(project.startDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">{new Date(project.endDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    project.status.statusName === "Completed" ? "bg-green-100 text-green-800" :
                    project.status.statusName === "Ongoing" ? "bg-blue-100 text-blue-800" :
                    project.status.statusName === "Delayed" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {project.status.statusName}
                  </span>
                </td>
                <td className="px-4 py-3 flex justify-center gap-3">
                  <button onClick={() => onEdit(project)} title="Edit project">
                    <PencilLine className="text-green-600 hover:text-green-700"/>
                  </button>
                  <button onClick={() => onDelete(project)} title="Delete project">
                    <Trash2 className="text-red-500 hover:text-red-700"/>
                  </button>
                  <button onClick={() => onView(project)} title="View project details">
                    <Eye className="text-slate-800 hover:text-slate-950"/>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-8">
                No projects found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      itemsPerPage={itemsPerPage}
      totalItems={projects.length}
      />

    </div>
  );
}