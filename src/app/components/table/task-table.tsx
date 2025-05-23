"use client"
import { CalendarCheck2, FileCheck2, TrafficCone, Trash2, Zap, ListCheck, CircleArrowRight, Hourglass, CalendarDays, User } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import DeleteConfirmation from "@/app/components/modal/delete-confirmation";
import Pagination from "../pagination";
import TableFilter from "@/app/components/function/filter-table";
import { Task } from "@/app/types/task";
import { getDocumentTypeOptions, getProjectOptions, getAssigneeOptions, statusOptions } from "@/app/utils/filter-utils";
import AddButton from "@/app/components/button/button-custom";
import { useSession } from "next-auth/react";
import { DateMonthYearFilter } from "../function/date-month-year-filter";
import TaskModal from "../modal/task-modal";



type TaskTableProps = {
  tasks: Task[]
  searchTerm?: string;
  onEdit?: (task: Task) => void;
  refreshTrigger?: number;
  onTaskDeleted?: () => void;
  employeeId?: string | null;
  projectId?: string | null;
  hideAssignedColumn?: boolean;
  userRole?: string | null;    
};

export default function TaskTable({ 
  tasks: passedTasks = [], // use passed tasks if available
  searchTerm = "",
  employeeId = null,
  projectId = null,
}: TaskTableProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(passedTasks.length ? false : true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearchQuery = useDebounce(searchTerm, 500);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const isEmployee = userRole !== 'admin' && userRole !== 'project_manager';
  const [refreshCounter, setRefreshCounter] = useState(0);
  const isDetailEmployeePage = pathname?.startsWith("/employees/detail-employee/");
  const [filters, setFilters] = useState({
    taskName: "",
    documentType: "",
    project: "",
    assignedTo: "",
    status: "",
    startDate: "",
    completedDate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Generate filter options
  const documentTypeOptions = useMemo(() => 
    [...getDocumentTypeOptions(tasks)], 
    [tasks]
  );

  const projectOptions = useMemo(() => 
    [ ...getProjectOptions(tasks)], 
    [tasks]
  );

  const assigneeOptions = useMemo(() => 
    [...getAssigneeOptions(tasks)], 
    [tasks]
  );

  const getTaskStatusStyles = (status: string) => {
    switch(status) {
      case "Done": 
        return "bg-green-100 text-green-800";
      case "OnGoing": 
        return "bg-blue-100 text-blue-800";
      case "ToDo": 
        return "bg-yellow-100 text-yellow-800";
      case "NotStarted":
        return "bg-red-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  

  // Filter tasks berdasarkan kriteria
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filter berdasarkan nama task
      const matchesTaskName = filters.taskName === "" || 
        task.taskName.toLowerCase().includes(filters.taskName.toLowerCase());
      
      // Filter berdasarkan document type
      const matchesDocumentType = filters.documentType === "" || 
        task.documentType.id.toString() === filters.documentType;
      
      // Filter berdasarkan project
      const matchesProject = filters.project === "" || 
        task.project.id.toString() === filters.project;
      
      // Filter berdasarkan assignee
      const matchesAssignee = filters.assignedTo === "" || 
        (filters.assignedTo === "unassigned" && !task.user) || 
        (task.user && task.user.id.toString() === filters.assignedTo);
      
      function normalizeDate(date: Date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate())
      }

      if (filters.startDate) {
        const filterStartDate = normalizeDate(new Date(filters.startDate))
        const taskStartDate = normalizeDate(new Date(task.dateAdded))
      
        if (taskStartDate < filterStartDate) {
          return false
        }
      }

      if (filters.completedDate) {
        // If task.completedDate does not exist, skip this task.
        if (!task.completedDate) return false;
        const filterCompletedDate = normalizeDate(new Date(filters.completedDate));
        const taskCompletedDate = normalizeDate(new Date(task.completedDate));
        if (taskCompletedDate > filterCompletedDate) return false;
      }

      // Filter berdasarkan status
      const matchesStatus = filters.status === "" || 
        task.taskStatus === filters.status;
         
        return matchesTaskName && matchesDocumentType && matchesProject && 
        matchesAssignee && matchesStatus;
    });
  }, [tasks, filters]);

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

    // In case the parent passes new tasks via props
    useEffect(() => {
      if (passedTasks.length > 0) {
        setTasks(passedTasks);
        setIsLoading(false);
      }
    }, [passedTasks]);

  useEffect(() => {
    if (passedTasks.length) return;

    let mounted = true;
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      try {
        const qs = debouncedSearchQuery
          ? `?search=${encodeURIComponent(debouncedSearchQuery)}`
          : "";
        const url =
          projectId
            ? `/api/projects/${projectId}/tasks${qs}`
            : employeeId
              ? `/api/employee/${employeeId}/tasks${qs}`
              : `/api/tasks${qs}`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();
        if (mounted) {
          setTasks(data);
          setError(null);
        }
      } catch (e: any) {
        if (mounted) {
          console.error(e);
          setError(e.message);
          toast.error("Error loading tasks", { description: e.message });
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [debouncedSearchQuery, refreshCounter, projectId, employeeId, passedTasks]);


  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
  };

  // Function to trigger a refresh of the TaskTable
  const refreshTasks = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  const handleTaskSaved = () => {
    setIsDetailOpen(false);
    refreshTasks();
  };
  
  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!selectedTask) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      toast.success("Task deleted")
      refreshTasks?.()     // trigger parent refreshTrigger
    } catch (err: any) {
      toast.error("Delete error", { description: err.message })
    } finally {
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
    }
  }

  const handleView = (task: Task) => {
    router.push(`/task/detail-task/${task.id}`);
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <>
    <div className="flex justify-end items-center space-x-2">
      {/* Task Name Filter */}
      <div>
        <input
          type="text"
          placeholder="Search by name..."
          className="px-2 py-2 border rounded-md text-sm w-full"
          value={filters.taskName}
          onChange={(e) => handleFilterChange("taskName", e.target.value)}
        />
      </div>
      <AddButton 
        text="+ Add Task" 
        onClick={() => setIsDetailOpen(true)}
      />
    </div>
    <div className="bg-white py-6 px-4 rounded-lg shadow-sm border mb-2">
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isEmployee ? 'lg:grid-cols-5' : 'lg:grid-cols-6'} gap-4`}>
        {/* Document Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
          <TableFilter
            column="documentType"
            options={documentTypeOptions}
            selectedValue={filters.documentType}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Project Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
          <TableFilter
            column="project"
            options={projectOptions}
            selectedValue={filters.project}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Start Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <DateMonthYearFilter
            value={filters.startDate}
            onChange={(value) => setFilters(prev => ({ ...prev, startDate: value }))}
            
          />
        </div>
        
        {/* Completed Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Completed Month</label>
          <DateMonthYearFilter
            value={filters.completedDate}
            onChange={(value) => setFilters(prev => ({ ...prev, completedDate: value }))}
          />
        </div>

        {/* Assignee Filter */}
        {!isEmployee && !isDetailEmployeePage && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
            <TableFilter
              column="assignedTo"
              options={assigneeOptions}
              selectedValue={filters.assignedTo}
              onFilterChange={handleFilterChange}
            />
          </div>
        )}

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <TableFilter
            column="status"
            options={statusOptions}
            selectedValue={filters.status}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>
    </div>

    <table className=" w-full table-auto justify-start">
      <thead className="bg-tersier">
        <tr>
          <th className="px-4 py-2 w-[5%] text-center rounded-tl-lg">
            <div className="flex items-center justify-center gap-1">
              #
            </div>
          </th>
          <th className="px-4 py-2 w-[20%] text-left">
            <div className="flex items-center gap-1">
              <ListCheck /> Task Name
            </div>
          </th>
          <th className="px-4 py-2 w-[15%] text-left">
            <div className="flex items-center gap-1">
              <FileCheck2 /> Document Type
            </div>
          </th>
          <th className="px-4 py-2 w-[10%] text-left">
            <div className="flex items-center gap-1">
              <TrafficCone /> Project
            </div>
          </th>
          {!isEmployee && (
            <th className="px-4 py-2 w-[15%] text-left">
              <div className="flex items-center gap-1">
                <User /> Assigned To
              </div>
            </th>
          )}
          <th className="px-4 py-2 w-[10%] text-left">
            <div className="flex items-center gap-1">
              <CalendarCheck2 /> Date Added
            </div>
          </th>
          <th className="px-4 py-2 w-[10%] text-left">
            <div className="flex items-center gap-1">
              <CalendarDays /> Completed Date
            </div>
          </th>
          <th className="px-4 py-2 w-[8%] text-left">
            <div className="flex items-center gap-1">
              <Hourglass /> Status
            </div>
          </th>
          <th className="px-4 py-2 w-[9%] text-center rounded-tr-lg">
            <div className="flex items-center justify-center gap-1">
              <Zap /> Act
            </div>
          </th>
        </tr>
      </thead>
        <tbody>
          {paginatedTasks.length > 0 ? (
            paginatedTasks.map((task, index) => (
              <tr key={task.id} className="border-b-2 border-tersier">
                <td className="px-4 py-3 text-center">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-4 py-3">{task.taskName}</td>
                <td className="px-4 py-3">{task.documentType.name}</td>
                <td className="px-4 py-3">{task.project.projectCode}</td>
                {!isEmployee && (<td className="px-4 py-3">{task.user?.name || 'Unassigned'}</td>)}
                <td className="px-4 py-3">{new Date(task.dateAdded).toLocaleDateString()}</td>
                <td className="px-4 py-3">{task.completedDate ? new Date(task.completedDate).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-sm ${getTaskStatusStyles(task.taskStatus)}`}>
                    {task.taskStatus.replace(/([a-z])([A-Z])/g, '$1 $2')}
                  </span>
                </td>
                <td>
                  <div className="px-4 py-3 flex gap-3 justify-center items-center">
                    {!isEmployee && 
                      <button onClick={() => handleDeleteTask(task)} title="Delete task">
                        <Trash2 className="text-red-500 hover:text-red-700" />
                      </button>
                    }
                    <button onClick={() => handleView(task)} title="View task details">
                      <CircleArrowRight className="text-blue-500 hover:text-blue-700"/>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center py-8">
                {searchTerm || Object.values(filters).some(f => f !== "") 
                  ? "No tasks match your search/filter criteria" 
                  : "No tasks available"}
              </td>
            </tr>
          )}
        </tbody>
    </table>
        
      {selectedTask && (
        <DeleteConfirmation
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteTask}
          name={selectedTask.taskName}
          entityType="task"
          title="Confirm Task Deletion"
          description="Deleting this task will remove all associated progress and checklist items. This action cannot be undone."
          isLoading={isDeleting}
        />
      )}
      
      <Pagination 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredTasks.length}
      />

      <TaskModal 
        open={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        onTaskSaved={handleTaskSaved}
      />
    </>
  );
}