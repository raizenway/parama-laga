"use client"
  
import { Input } from "@/components/ui/input"
import AddButton from "@/app/components/button/button";
import { useState } from "react";
import TaskTable from "@/app/components/table/task-table";
import TaskModal from "@/app/components/modal/task-modal";

  export default function Page() {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    return (
      <div className="mx-8 h-screen flex-wrap space-y-5 ">
        
        
        {/* Baris 2 */}
        <div className="mt-12 grow">
          <div className="font-poppins font-bold text-2xl">Tasks</div>
          <div className="flex justify-end items-center gap-3">
          <Input className="w-72" type="email" placeholder="Search" />
            <AddButton text="+ Add Task" onClick={() => setIsDetailOpen(true)}/>
          </div>
                <div className="grow h-96 bg-white rounded-2xl flex justify-center items-start p-4">
                  <div className= "max-h-full w-full ">
                      <TaskTable />
                  </div>
                </div>
        </div>
        <TaskModal open={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
        
      </div>
      
    )
  }