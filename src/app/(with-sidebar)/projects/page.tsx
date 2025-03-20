"use client"
import { Input } from "@/components/ui/input"
import ProjectTable from "@/app/components/table/project-table";
import AddButton from "@/app/components/button/button";
import { useState } from "react";
import ProjectModal from "@/app/components/modal/project-modal";

  export default function Page() {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    return (
      <div className="mx-8 h-screen flex-wrap space-y-5 ">
        <div className="mt-12 grow">
          <div className="font-poppins font-bold text-2xl">Projects</div>
          <div className="flex justify-end items-center gap-3">
            <Input className="w-72" placeholder="Search" />
            <AddButton text="+ Add Project" onClick={() => setIsDetailOpen(true)}/>
          </div>
                <div className="grow h-96 bg-white rounded-2xl flex justify-center items-start p-4">
                  <div className= "max-h-full w-full ">
                    <ProjectTable />
                  </div>
                </div>
        </div>
        <ProjectModal open={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
      </div>
      
    )
  }