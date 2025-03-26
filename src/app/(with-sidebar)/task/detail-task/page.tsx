"use client"
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import SubmitButton from "@/app/components/button/button-custom";
import SingleSelection from "@/app/components/dropdown-single-selection";
import CheckListTable from "@/app/components/table/check-list";
import { Input } from "@/components/ui/input";

const statuses = ["Done", "On Going", "To Do"];

type Task = {
  id: number;
  taskName: string;
  iteration: number;
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

type User = {
  id: number;
  name: string;
  personnelId: string | null;
  email: string;
};

export default function DetailTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('id');
  
  const [task, setTask] = useState<Task | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch task details
  useEffect(() => {
    if (!taskId) {
      toast.error("Task ID is missing");
      router.push('/task');
      return;
    }

    const fetchTaskDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/tasks/${taskId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch task details");
        }
        
        const taskData = await response.json();
        
        setTask(taskData);
        
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
        }

        // Fetch available users for assignment (same endpoint as employee)
        const usersResponse = await fetch('/api/employee');
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch employees");
        }
        const usersData = await usersResponse.json();
        setAvailableUsers(usersData);
        
      } catch (error) {
        console.error("Error fetching task details:", error);
        toast.error("Failed to load task details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId, router]);

  const handleSubmit = async () => {
    if (!task) return;
    
    setIsSaving(true);
    try {
      // Update task data
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          assignee: selectedAssignee, // Now sending a single assignee instead of an array
          status: selectedStatus
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      
      toast.success("Task updated successfully");
      
      // Refresh page data
      router.refresh();
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
        <button onClick={() => router.back()} className="font-poppins flex gap-2">
          <ChevronLeft /> Back
        </button>
        <div className="font-poppins font-bold text-2xl">{task.taskName}</div>
        <div className="grid grow gap-2 mt-5 lg:w-1/2">                               
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              Document Type
              <Input 
                className="border-black bg-slate-200" 
                value={task.documentType.name} 
                disabled
              />
            </div>
            <div className="flex flex-col gap-2">
              Project
              <Input 
                className="border-black bg-slate-200" 
                value={task.project.projectName} 
                disabled
              />
            </div>
            <div className="flex flex-col col-span-1 md:col-span-2 gap-2">
              Status
              <SingleSelection 
                options={statuses}
                selectedItem={selectedStatus}
                setSelectedItem={setSelectedStatus}
              />
            </div>
            <div className="flex flex-col col-span-1 md:col-span-2 gap-2">
                Assign to Employee
                {selectedStatus === "To Do" ? (
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
          <div className="font-bold text-emerald-500">Iterasi ke-{task.iteration}</div>                  
        </div>
        
        {/* Now we pass the taskId to our ChecklistTable */}
        {Number(taskId) > 0 && <CheckListTable taskId={Number(taskId)} />}
        
        <div className="justify-items-end pt-2">
          <SubmitButton   
            text={isSaving ? "Saving..." : "Submit"}
            onClick={handleSubmit}
            color='bg-primary'
            hoverColor='hover:bg-indigo-900'
            textColor="text-zinc-100"
            width="w-full md:w-1/5"
            height="h-12"
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
}