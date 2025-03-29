"use client"
import { CalendarCheck2, FileText, Eye, PencilLine, TrafficCone, Trash2, Zap, ListCheck, CircleArrowRight, Hourglass, User,CalendarDays } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmation from "@/app/components/modal/delete-confirmation";
import Pagination from "../pagination";

type Task = {
  id: number;
  taskName: string;
  documentType: {
    id: number;
    name: string;
  };
  project: {
    id: number;
    projectName: string;
  };
  dateAdded: string;
  user: {
    id: number;
    name: string;
  };
  progresses: {
    id: number;
    checked: boolean;
  }[];
  completedDate?: string | null; // Add this field to track completion date
};

// Add userRole to the component props
type TaskTableProps = {
  searchTerm?: string;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  refreshTrigger?: number;
  onTaskDeleted?: () => void;
  userRole?: string | null; // Add new prop for user role
  employeeId?: string;
  projectId?: string;
};

export default function TaskTable({ 
  searchTerm = "", 
  onEdit, 
  onDelete,
  refreshTrigger = 0,
  onTaskDeleted,
  userRole = null,
  employeeId = null,
  projectId = null
}: TaskTableProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearchQuery = useDebounce(searchTerm, 500);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Check if user is admin or project_manager
  // const isManagerOrAdmin = userRole === 'admin' || userRole === 'project_manager';
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const paginatedTasks = tasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Fetch tasks
  const fetchTasks = async (query = "") => {
    setIsLoading(true);
    try {
      // If employee role, the API will filter tasks by userId automatically
      let url;
      // Priority order: projectId first, then employeeId, then general tasks
      if (projectId) {
        // Use project-specific API endpoint
        url = query 
          ? `/api/projects/${projectId}/tasks?search=${encodeURIComponent(query)}`
          : `/api/projects/${projectId}/tasks`;
      } else
      if (employeeId) {
        // Use the employee-specific API endpoint
        url = query 
          ? `/api/employee/${employeeId}/tasks?search=${encodeURIComponent(query)}`
          : `/api/employee/${employeeId}/tasks`;
      } else {
        // Use the general tasks API endpoint
        url = query 
          ? `/api/tasks?search=${encodeURIComponent(query)}` 
          : "/api/tasks";
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks");
      toast.error("Error", {
        description: "Failed to load tasks. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Effect to fetch tasks when search term changes
  useEffect(() => {
    fetchTasks(debouncedSearchQuery);
  }, [debouncedSearchQuery, refreshTrigger, projectId, employeeId]);

  // Calculate task status based on progress
  const getTaskStatus = (task: Task) => {
    if (!task.progresses || task.progresses.length === 0) return "Not Started";
    
    const completedCount = task.progresses.filter(p => p.checked).length;
    const totalCount = task.progresses.length;
    
    if (completedCount === 0) return "To Do";
    if (completedCount === totalCount) return "Done";
    return "On Going";
  };

  // Handle edit action if provided
  const handleEdit = (task: Task) => {
    if (onEdit) {
      onEdit(task);
    } else {
      router.push(`/task/detail-task?id=${task.id}`);
    }
  };
  
  // Handle delete action
  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!selectedTask) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete task');
      }
      
      toast.success('Task deleted successfully');
      
      // Refresh the task list
      fetchTasks(debouncedSearchQuery);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task', { 
        description: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Handle view action
  const handleView = (task: Task) => {
    router.push(`/task/detail-task?id=${task.id}`);
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
    <table className="font-poppins w-full table-auto justify-start">
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
              <FileText /> Document Type
            </div>
          </th>
          <th className="px-4 py-2 w-[10%] text-left">
            <div className="flex items-center gap-1">
              <TrafficCone /> Project
            </div>
          </th>
          <th className="px-4 py-2 w-[15%] text-left">
            <div className="flex items-center gap-1">
              <User /> Assigned To
            </div>
          </th>
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
              <td className="px-4 py-3">{task.user?.name || 'Unassigned'}</td>
              <td className="px-4 py-3">{new Date(task.dateAdded).toLocaleDateString()}</td>
              <td className="px-4 py-3">{task.completedDate ? new Date(task.completedDate).toLocaleDateString() : '-'}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  getTaskStatus(task) === "Done" ? "bg-green-100 text-green-800" :
                  getTaskStatus(task) === "On Going" ? "bg-blue-100 text-blue-800" : 
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {getTaskStatus(task)}
                </span>
              </td>
              <td className="px-4 py-3 flex gap-3 justify-center">
                <>
                  <button onClick={() => handleDeleteTask(task)} title="Delete task">
                    <Trash2 className="text-red-500 hover:text-red-700"/>
                  </button>
                </>
                <button onClick={() => handleView(task)} title="View task details">
                  <CircleArrowRight className="text-blue-500 hover:text-blue-700"/>
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={9} className="text-center py-8">
              {searchTerm ? "No tasks match your search" : "No tasks available"}
            </td>
          </tr>
        )}
      </tbody>
    </table>
    {selectedTask && ( // Add this conditional check
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
      totalItems={tasks.length}
    />
  </>
  );
}