"use client"
  
import { Input } from "@/components/ui/input"
import TemplateModal from "@/app/components/modal/template-modal";
import AddButton from "@/app/components/button/add-button";
import { useState } from "react";
import TemplateTable from "@/app/components/table/template-table";
import CheckListModal from "@/app/components/modal/check-list-modal";

  export default function Page() {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCheckListDetailOpen, setIsCheckListDetailOpen] = useState(false)
    return (
      <div className="mx-8 h-screen flex-wrap space-y-5 ">
        
        
        {/* Baris 2 */}
        <div className="mt-12 grow">
          <div className="font-poppins font-bold text-2xl">Templates</div>
          <div className="flex justify-end items-center gap-3">
          <Input className="w-72" type="email" placeholder="Search" />
            <AddButton text="+ Add Template" onClick={() => setIsDetailOpen(true)}/>
            <AddButton text="Edit Check List" onClick={() => setIsCheckListDetailOpen(true)}/>
          </div>
                <div className="grow h-96 bg-white rounded-2xl flex justify-center items-start p-4">
                  <div className= "max-h-full w-full ">
                      <TemplateTable />
                  </div>
                </div>
        </div>
        <TemplateModal open={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
        <CheckListModal open={isCheckListDetailOpen} onClose={() => setIsCheckListDetailOpen(false)} />
      </div>
      
    )
  }