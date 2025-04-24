"use client"
import { CalendarCheck2, FileCheck2, TrafficCone, Trash2, Zap, ListCheck, CircleArrowRight, Hourglass, CalendarDays, User } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmation from "@/app/components/modal/delete-confirmation";
import Pagination from "../pagination";
import TableFilter from "@/app/components/function/filter-table";
import { Task } from "@/app/types/task";
import { getDocumentTypeOptions, getProjectOptions, getAssigneeOptions, statusOptions } from "@/app/utils/filter-utils";
import { MonthYearFilter } from "@/app/components/function/month-year-filter";

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
  searchTerm = "",
  refreshTrigger = 0,
  onTaskDeleted,
  employeeId = null,
  projectId = null,
  hideAssignedColumn = false
}: TaskTableProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearchQuery = useDebounce(searchTerm, 500);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
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
        return "bg-gray-100 text-gray-800";
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
      

         // Start Date Filter
         if (filters.startDate) {
          const [filterYear, filterMonth] = filters.startDate.split('-').map(Number)
          const taskStart = new Date(task.dateAdded)
          const taskStartYear = taskStart.getFullYear()
          const taskStartMonth = taskStart.getMonth() + 1 // Month is 0-indexed
  
          if (taskStartYear < filterYear || 
              (taskStartYear === filterYear && taskStartMonth < filterMonth)) {
            return false
          }
        }
  
        // Completed Date Filter
        if (filters.completedDate) {
          const [filterYear, filterMonth] = filters.completedDate.split('-').map(Number)
          const taskCompleted = new Date(task.completedDate)
          const taskCompletedYear = taskCompleted.getFullYear()
          const taskCompletedMonth = taskCompleted.getMonth() + 1
  
          if (taskCompletedYear > filterYear || 
              (taskCompletedYear === filterYear && taskCompletedMonth > filterMonth)) {
            return false
          }
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

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      try {
        const qs = debouncedSearchQuery ? `?search=${encodeURIComponent(debouncedSearchQuery)}` : ""
        const url = projectId
          ? `/api/projects/${projectId}/tasks${qs}`
          : employeeId
            ? `/api/employee/${employeeId}/tasks${qs}`
            : `/api/tasks${qs}`

        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error("Failed to fetch tasks")
        const data = await res.json()
        if (mounted) {
          setTasks(data)
          setError(null)
        }
      } catch (e: any) {
        if (mounted) {
          console.error(e)
          setError(e.message)
          toast.error("Error loading tasks", { description: e.message })
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
      controller.abort()
    }
  }, [debouncedSearchQuery, refreshTrigger, projectId, employeeId])

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
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
      onTaskDeleted?.()     // trigger parent refreshTrigger
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
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-2">
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${hideAssignedColumn ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-4`}>
        {/* Task Name Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 ">Task Name</label>
          <input
            type="text"
            placeholder="Filter by name..."
            className="px-2 py-1 border rounded-md text-sm w-full"
            value={filters.taskName}
            onChange={(e) => handleFilterChange("taskName", e.target.value)}
          />
        </div>

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Month</label>
          <MonthYearFilter
            value={filters.startDate}
            onChange={(value) => setFilters(prev => ({ ...prev, startDate: value }))}
            placeholder="Select start month"
          />
        </div>
        
        {/* Completed Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Completed Month</label>
          <MonthYearFilter
            value={filters.completedDate}
            onChange={(value) => setFilters(prev => ({ ...prev, completedDate: value }))}
            placeholder="Select Completed month"
          />
        </div>

        {/* Assignee Filter */}
        {!hideAssignedColumn && (
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
          {!hideAssignedColumn && (
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
                <td className="px-4 py-3">{task.project.projectName}</td>
                {!hideAssignedColumn && (<td className="px-4 py-3">{task.user?.name || 'Unassigned'}</td>)}
                <td className="px-4 py-3">{new Date(task.dateAdded).toLocaleDateString()}</td>
                <td className="px-4 py-3">{task.completedDate ? new Date(task.completedDate).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-sm ${getTaskStatusStyles(task.taskStatus)}`}>
                    {task.taskStatus}
                  </span>
                </td>
                <td>
                  <div className="px-4 py-3 flex gap-3 justify-center">
                    <button onClick={() => handleDeleteTask(task)} title="Delete task">
                      <Trash2 className="text-red-500 hover:text-red-700"/>
                    </button>
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
    </>
  );
}