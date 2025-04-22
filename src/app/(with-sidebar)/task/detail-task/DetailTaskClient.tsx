"use client";
// export const dynamic = "force-dynamic";
// import { Suspense } from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter} from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import SubmitButton from "@/app/components/button/button-custom";
import SingleSelection from "@/app/components/dropdown-single-selection";
import CheckListTable from "@/app/components/table/check-list";
import TaskUpdateConfirmation from "@/app/components/modal/task-update-confirmation";
import { Input } from "@/components/ui/input";

type Task = {
  id: number;
  taskName: string;
  dateAdded: string;
  documentType: {
    id: number;
    name: string;
  };
  project: {
    id: number;
    projectName: string;
  };
  user: {
    id: number;
    name: string;
  };
  template: {
    id: number;
    templateName: string;
  };
  progresses: {
    id: number;
    checked: boolean;
    comment: string | null;
    checklist: {
      id: number;
      criteria: string;
    }
  }[];
};

type TaskProgress = {
  id: number;
  taskId: number;
  checklistId: number;
  checked: boolean;
  comment: string | null;
  updatedAt: Date | null;
  checklist: {
    id: number;
    criteria: string;
  };
  isDirty?: boolean;
};

type User = {
  id: number;
  name: string;
  personnelId: string | null;
  email: string;
};

type DocumentType = {
  id: number;
  name: string;
};

type Project = {
  id: number;
  projectName: string;
};

type DetailTaskClientProps = {
  taskId: string;
};


export default function DetailTaskClient({ taskId }: DetailTaskClientProps) {
  const router = useRouter(); 
  // guard against null
  // const taskId = searchParams?.get('id');
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const isManagerOrAdmin = userRole === 'admin' || userRole === 'project_manager';

  // Task data and form state
  const [task, setTask] = useState<Task | null>(null);
  const [taskName, setTaskName] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for document types and projects
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // State for checklist items
  const [progressItems, setProgressItems] = useState<TaskProgress[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Track form changes
  const [originalTaskName, setOriginalTaskName] = useState<string>("");
  const [originalDocType, setOriginalDocType] = useState<string | null>(null);
  const [originalProject, setOriginalProject] = useState<string | null>(null);
  const [originalAssignee, setOriginalAssignee] = useState<string | null>(null);

  // Fetch task details
  const fetchTaskDetails = useCallback(async () => {
    if (!taskId) {
      toast.error("Task ID is missing");
      router.push('/task');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch task details");
      }
      
      const taskData = await response.json();
      
      setTask(taskData);
      setTaskName(taskData.taskName || "");
      setOriginalTaskName(taskData.taskName || "");
      
      // Set initial status based on progress
      const completedItems = taskData.progresses?.filter((p: any) => p.checked).length || 0;
      const totalItems = taskData.progresses?.length || 0;
      
      let initialStatus: string;
      if (totalItems === 0) {
        initialStatus = "To Do";
      } else if (completedItems === totalItems) {
        initialStatus = "Done";
      } else if (completedItems > 0) {
        initialStatus = "On Going";
      } else {
        initialStatus = "To Do";
      }
      
      setSelectedStatus(initialStatus);

      // Set current assignee
      if (taskData.user && taskData.user.name) {
        setSelectedAssignee(taskData.user.name);
        setOriginalAssignee(taskData.user.name);
      }

      // Set initial document type and project
      if (taskData.documentType) {
        setSelectedDocumentType(taskData.documentType.name);
        setOriginalDocType(taskData.documentType.name);
      }
      
      if (taskData.project) {
        setSelectedProject(taskData.project.projectName);
        setOriginalProject(taskData.project.projectName);
      }

      try {
        // Fetch employees
        if (isManagerOrAdmin) {
          const usersResponse = await fetch('/api/employee');
          if (!usersResponse.ok) {
            throw new Error("Failed to fetch employees");
          }
          const usersData = await usersResponse.json();
          setAvailableUsers(usersData);
        }
        
        // Fetch document types
        const docTypesResponse = await fetch('/api/document-types');
        if (!docTypesResponse.ok) {
          throw new Error("Failed to fetch document types");
        }
        const docTypesData = await docTypesResponse.json();
        setDocumentTypes(docTypesData);
        
        // Fetch projects
        const projectsResponse = await fetch('/api/projects');
        if (!projectsResponse.ok) {
          throw new Error("Failed to fetch projects");
        }
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dropdown options");
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
      toast.error("Failed to load task details");
    } finally {
      setIsLoading(false);
    }
  }, [taskId, isManagerOrAdmin]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  // Handle task name change
  const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskName(e.target.value);
  };

  const handleProgressItemsChange = (items: TaskProgress[]) => {
    setProgressItems(items);
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return (
      taskName !== originalTaskName ||
      selectedDocumentType !== originalDocType ||
      selectedProject !== originalProject ||
      selectedAssignee !== originalAssignee ||
      progressItems.some(item => item.isDirty)
    );
  };

  const handleSubmitClick = () => {
    if (hasUnsavedChanges()) {
      setIsConfirmModalOpen(true);
    } else {
      toast.info("No changes to save");
    }
  };

  const handleConfirmSubmit = async () => {
    if (!task) return;
    
    // Basic validation
    if (!taskName.trim()) {
      toast.error("Task name cannot be empty");
      return;
    }
    
    setIsSaving(true);
    try {
      // Find the IDs for the selected document type and project
      const documentTypeId = documentTypes.find(dt => dt.name === selectedDocumentType)?.id || task.documentType.id;
      const projectId = projects.find(p => p.projectName === selectedProject)?.id || task.project.id;
      
      // Check if all checklist items are completed
      const allChecked = progressItems.every(item => item.checked);
      const anyChecked = progressItems.some(item => item.checked);
      
      let taskStatus = "ToDo";
      let completedDate = null;
      
      if (allChecked && progressItems.length > 0) {
        taskStatus = "Done";
        completedDate = new Date();
      } else if (anyChecked) {
        taskStatus = "OnGoing";
      }
      
      const payload: {
        taskName: string;
        documentTypeId: number;
        projectId: number;
        taskStatus: string;
        completedDate: Date | null;
        userId?: number; // Add optional userId property
      } = {
        taskName: taskName.trim(),
        documentTypeId,
        projectId,
        taskStatus,
        completedDate
      };
      
      // Only include assignee if user is admin or manager
      if (isManagerOrAdmin && selectedAssignee) {
        // Find the user ID for the selected assignee
        const assigneeUser = availableUsers.find(u => u.name === selectedAssignee);
        if (assigneeUser) {
          payload.userId = assigneeUser.id;
        }
      }
      
      // Save task details first
      const taskResponse = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!taskResponse.ok) {
        throw new Error("Failed to update task");
      }
      
      // If there are checklist changes, save them too
      const dirtyItems = progressItems.filter(item => item.isDirty);
      if (dirtyItems.length > 0) {
        const progressResponse = await fetch(`/api/task-progress/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dirtyItems.map(item => ({
            id: item.id,
            checked: item.checked,
            comment: item.comment,
            updatedAt: new Date()
          }))),
        });
        
        if (!progressResponse.ok) {
          throw new Error("Failed to update checklist items");
        }
      }
      
      toast.success("Task updated successfully");
      
      // Refresh task data with the latest changes
      fetchTaskDetails();
      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin mr-2" />
        <span className="text-xl">Loading task details...</span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-8">
        <div className="p-7 py-8 rounded-lg bg-zinc-50 shadow-[0px_0px_13px_2px_rgba(0,_0,_0,_0.15)]">
          <div className="text-red-500">Task not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="space-y-5 p-7 py-8 rounded-lg bg-zinc-50 shadow-[0px_0px_13px_2px_rgba(0,_0,_0,_0.15)]">
        <button onClick={() => router.back()} className=" flex gap-2">
          <ChevronLeft /> Back
        </button>
        
        {/* Task Name - Now editable */}
        <div className="space-y-2">
          <label htmlFor="taskName" className=" font-medium">Task Name</label>
          <Input 
            id="taskName"
            value={taskName}
            onChange={handleTaskNameChange}
            className=" text-xl font-semibold"
            placeholder="Enter task name"
          />
        </div>
        
        <div className="grid grow gap-2 mt-5 lg:w-1/2">                               
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              Document Type
                <SingleSelection 
                  options={documentTypes.map(dt => dt.name)}
                  selectedItem={selectedDocumentType}
                  setSelectedItem={setSelectedDocumentType}
                />
            </div>
            <div className="flex flex-col gap-2">
              Project
                <SingleSelection 
                  options={projects.map(p => p.projectName)}
                  selectedItem={selectedProject}
                  setSelectedItem={setSelectedProject}
                />
            </div>
            <div className="flex flex-col col-span-1 md:col-span-2 gap-2">
              Status
              <Input 
                className="border-black bg-slate-200" 
                value={selectedStatus || ""} 
                disabled
              />
            </div>
            <div className="flex flex-col col-span-1 md:col-span-2 gap-2">
              Assign to Employee
              {isManagerOrAdmin ? (
                <SingleSelection
                  options={availableUsers.map(user => user.name)}
                  selectedItem={selectedAssignee}
                  setSelectedItem={setSelectedAssignee}
                />
              ) : (
                <Input
                  className="border-black bg-slate-200"
                  value={selectedAssignee || "Not assigned"}
                  disabled
                />
              )}
            </div>
          </div>             
        </div>
        
        {/* Checklist table */}
        {Number(taskId) > 0 && (
          <CheckListTable 
            taskId={Number(taskId)} 
            userRole={userRole} 
            onProgressChange={handleProgressItemsChange}
          />
        )}
        
        <div className="justify-items-end pt-2">
          <SubmitButton   
            text={hasUnsavedChanges() ? "Submit Changes" : "No Changes"}
            onClick={() => {
              if (!isSaving && hasUnsavedChanges()) {
                handleSubmitClick();
              }
            }}
            color={isSaving || !hasUnsavedChanges() ? 'bg-gray-400' : 'bg-primary'}
            hoverColor={isSaving || !hasUnsavedChanges() ? 'hover:bg-gray-500' : 'hover:bg-indigo-900'}
            textColor="text-zinc-100"
            width="w-full md:w-1/5"
            height="h-12"
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <TaskUpdateConfirmation
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        isLoading={isSaving}
        title="Konfirmasi Update Task"
        description={
          <>
            <p>Apakah Anda yakin ingin menyimpan semua perubahan pada task ini?</p>
            <p className="text-sm text-gray-600 mt-2">
              Semua perubahan pada task dan checklist akan disimpan.
            </p>
          </>
        }
      />
    </div>);
}