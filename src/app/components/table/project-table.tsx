import { Building2, CalendarCheck2, CalendarClock, Clock, CreditCard, Eye, MoveDown, PencilLine, TrafficCone, Trash2, Zap, CircleArrowRight} from "lucide-react"
import { useState } from "react";
import Pagination from "../pagination";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  return (
    <div>
      <table className="font-poppins w-full table-auto justify-start">
        <thead className="bg-tersier">
          <tr className="text-black">
            {[
              { label: "Logo", width: "w-[5%] h-[50px]" },
              { icon: <TrafficCone />, label: "Project", width: "w-[20%] h-[50px]" },
              { icon: <Building2 />, label: "Company", width: "w-[20%] h-[50px]" },
              { icon: <CreditCard />, label: "Project ID", width: "w-[10%] h-[50px]" },
              { icon: <CalendarCheck2 />, label: "Start Date", width: "w-[10%] h-[50px]" },
              { icon: <CalendarClock />, label: "End Date", width: "w-[10%] h-[50px]" },
              { icon: <Clock />, label: "Status", width: "w-[10%] h-[50px]" },
              { icon: <Zap />, label: "Act", width: "w-[15%]" },
            ].map(({ icon, label, width }, i) => (
              <th
                key={i}
                className={`px-4 py-2 ${width} ${
                  i === 0 ? "rounded-tl-lg" : ""
                } ${i === 7 ? "rounded-tr-lg" : ""}`}
              >
                <div className="flex items-center gap-1">
                  {icon} {label}
                </div>
              </th>
            ))}
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
                  <button 
                  onClick={() => router.push(`/projects/detail-project/${project.id}`)} 
                  className="text-blue-600 hover:text-blue-700"
                  title="Go to project details page"
                >
                  <CircleArrowRight />
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