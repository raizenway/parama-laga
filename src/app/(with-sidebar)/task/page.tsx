"use client"
  
import { Input } from "@/components/ui/input"
import AddButton from "@/app/components/button/button-custom";
import { useState, useCallback } from "react";
import TaskTable from "@/app/components/table/task-table";
import TaskModal from "@/app/components/modal/task-modal";

export default function Page() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Function to trigger a refresh of the TaskTable
  const refreshTasks = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);
  
  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Function to call when a task is saved/updated
  const handleTaskSaved = () => {
    setIsDetailOpen(false);
    refreshTasks();
  };
  
  return (
    <div className="mx-8 h-screen flex-wrap space-y-5 ">
      {/* Baris 2 */}
      <div className="mt-12 grow">
        <div className="font-poppins font-bold text-2xl">Tasks</div>
        <div className="flex justify-end items-center gap-3">
          <Input 
            className="w-72" 
            placeholder="Search" 
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <AddButton text="+ Add Task" onClick={() => setIsDetailOpen(true)}/>
        </div>
        <div className="grow h-96 bg-white rounded-2xl flex justify-center items-start p-4">
          <div className="max-h-full w-full">
            <TaskTable 
              searchTerm={searchQuery}
              refreshTrigger={refreshCounter}
              onTaskDeleted={refreshTasks}
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
  )
}