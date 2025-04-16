"use client"
  
import { useState, useCallback, useEffect } from "react";
import AddButton from "@/app/components/button/button-custom";
import TaskTable from "@/app/components/table/task-table";
import TaskModal from "@/app/components/modal/task-modal";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function Page() {
  const { data: session, status } = useSession();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery] = useState("");
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user role from session
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUserRole((session.user as any).role);
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [session, status]);
  
  // Function to trigger a refresh of the TaskTable
  const refreshTasks = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);
  
  // Function to call when a task is saved/updated
  const handleTaskSaved = () => {
    setIsDetailOpen(false);
    refreshTasks();
  };
    
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading...</span>
      </div>
    );
  }
  
  return (
    <div className="mx-8 h-screen flex-wrap space-y-5">
      <div className="mt-12 grow">
        <div className=" font-bold text-2xl">Tasks</div>
        <div className="flex justify-end items-center gap-3">
          {/* <Input 
            className="w-72" 
            placeholder="Search" 
            value={searchQuery}
            onChange={handleSearchChange}
          /> */}
            <AddButton 
              text="+ Add Task" 
              onClick={() => setIsDetailOpen(true)}
            />
        </div>
        <div className="grow h-96 bg-white rounded-2xl flex justify-center items-start p-4">
          <div className="max-h-full w-full">
            <TaskTable 
              searchTerm={searchQuery}
              refreshTrigger={refreshCounter}
              onTaskDeleted={refreshTasks}
              userRole={userRole}
            />
          </div>
        </div>
      </div>  
        <TaskModal 
          open={isDetailOpen} 
          onClose={() => setIsDetailOpen(false)} 
          onTaskSaved={handleTaskSaved}
        />
    </div>
  );
}