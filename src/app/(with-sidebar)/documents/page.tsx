"use client"
  
import { Input } from "@/components/ui/input"
import AddButton from "@/app/components/button/button-custom";
import { useState } from "react";
import DocumentTable from "@/app/components/table/task-table";
import DocumentModal from "@/app/components/modal/task-modal";

  export default function Page() {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    return (
      <div className="mx-8 h-screen flex-wrap space-y-5 ">

        
        {/* Baris 2 */}
        <div className="mt-12 grow">
          <div className=" font-bold text-2xl">Documents</div>
          <div className="flex justify-end items-center gap-3">
          <Input className="w-72" placeholder="Search" />
            <AddButton text="+ Add Document" onClick={() => setIsDetailOpen(true)}/>
          </div>
                <div className="grow h-96 bg-white rounded-2xl flex justify-center items-start p-4">
                  <div className= "max-h-full w-full ">
                      <DocumentTable />
                  </div>
                </div>
        </div>
        <DocumentModal open={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
        
      </div>
      
    )
  }