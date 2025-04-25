import { Building2, CalendarCheck2, CalendarClock, Clock, CreditCard, Eye, PencilLine, TrafficCone, Trash2, Zap, CircleArrowRight} from "lucide-react"
import { useMemo, useState } from "react";
import Pagination from "../pagination";
import { useRouter } from "next/navigation";
import { Project } from "@/app/types/project";
import TableFilter from "../function/filter-table";
import { getProjectStatusOptions } from "@/app/utils/filter-utils";
import { DateMonthYearFilter } from "../function/date-month-year-filter";
import AddButton from "../button/button-custom";
import ProjectModal from "../modal/project-modal";

type ProjectTableProps = {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onView: (project: Project) => void; // Add onView prop
};

export default function ProjectTable({ projects, onEdit, onDelete, onView }: ProjectTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();
  const [filters, setFilters] = useState({
    projectName: "",
    companyName: "",
    status: "",
    startDate: "",
    endDate: ""
  });


  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Filter berdasarkan nama project
      const matchesProjectName = filters.projectName === "" || 
      project.projectName.toLowerCase().includes(filters.projectName.toLowerCase());

      const matchesCompanyName = filters.companyName === "" || 
      project.projectOwner.toLowerCase().includes(filters.companyName.toLowerCase());
      
      // Filter berdasarkan status
      const matchesStatus = filters.status === "" || 
        project.status.statusName === filters.status;
      
       // Start Date Filter
      if (filters.startDate) {
        const [filterYear, filterMonth] = filters.startDate.split('-').map(Number)
        const projectStart = new Date(project.startDate)
        const projectStartYear = projectStart.getFullYear()
        const projectStartMonth = projectStart.getMonth() + 1 // Month is 0-indexed

        if (projectStartYear < filterYear || 
            (projectStartYear === filterYear && projectStartMonth < filterMonth)) {
          return false
        }
      }

      // End Date Filter
      if (filters.endDate) {
        const [filterYear, filterMonth] = filters.endDate.split('-').map(Number)
        const projectEnd = new Date(project.endDate)
        const projectEndYear = projectEnd.getFullYear()
        const projectEndMonth = projectEnd.getMonth() + 1

        if (projectEndYear > filterYear || 
            (projectEndYear === filterYear && projectEndMonth > filterMonth)) {
          return false
        }
      }

      return matchesProjectName && matchesCompanyName && matchesStatus;
    });
  }, [projects, filters]);

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    setCurrentPage(1);
  };

  const handleAddProject = () => {
    setSelectedProject(null);
    setModalMode("add");
    setIsModalOpen(true);
  };
  
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
          <div className="flex justify-end items-center space-x-2">
            {/* Task Name Filter */}
            <div>
              <input
                type="text"
                placeholder="Search by name..."
                className="px-2 py-2 border rounded-md text-sm w-full"
                value={filters.projectName}
                onChange={(e) => handleFilterChange("projectName", e.target.value)}
              />
            </div>
            <AddButton 
              text="+ Add Project" 
              onClick={() => setIsModalOpen(true)}
            />
          </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-2">
        <div className="grid grid-cols-5 gap-4">
    
          {/* Company Type Filter */}
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 ">Company Name</label>
            <input
              type="text"
              placeholder="Filter by name..."
              className="px-2 py-1 border rounded-md text-sm w-full"
              value={filters.companyName}
              onChange={(e) => handleFilterChange("companyName", e.target.value)}
            />
          </div>
  
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <TableFilter
              column="status"
              options={getProjectStatusOptions(projects)}
              selectedValue={filters.status}
              onFilterChange={handleFilterChange}
            />
          </div>

           {/* Start Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <DateMonthYearFilter
              value={filters.startDate}
              onChange={(value) => setFilters(prev => ({ ...prev, startDate: value }))}
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <DateMonthYearFilter
              value={filters.endDate}
              onChange={(value) => setFilters(prev => ({ ...prev, endDate: value }))}
            />
          </div>
        </div>
      </div>

      <table className=" w-full table-auto justify-start">
        <thead className="bg-tersier">
          <tr className="text-black">
            {[
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
                } ${i === 6 ? "rounded-tr-lg" : ""}`}
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
      totalItems={filteredProjects.length}
      />
      
      <ProjectModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        project={selectedProject}
        mode={modalMode}
      />
    </div>
  );
}