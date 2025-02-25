"use client"
import { useState } from "react";
import { Input } from "@/components/ui/input";
import StatusDropdown from "../status-dropdown";
import ProjectAssigning from "../project-assigning";
import { Button } from "@/components/ui/button";
import EmployeeAssigning from "../button/employee-assigning";

export default function ProjectForm({onClose} : {onClose: () => void}) {
  const [position, setPosition] = useState("Status")
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const removeItem = (value: string) => {
    setSelectedItems((prev) => prev.filter((item) => item !== value));
  };
  
  return (
    <div className="w-full bg-white">
      <form className="font-poppins space-y-5">
        
        <div className="flex grow gap-8">
          <img src="kai.png" className="rounded-full max-h-32 max-w-32"></img>

          
          <div className="flex flex-col grow gap-2">
            {/* PROJECT INFO */}
            <h1 className="my-1">Project Info</h1>
              <Input placeholder="Project Name"/>
              <Input placeholder="Company"/>
              <Input placeholder="Project ID"/>
              <Input placeholder="Date Started"/>
              <Input placeholder="Date Ended"/>
              <StatusDropdown position={position} setPosition={setPosition}/>

            
            {/*EMPLOYEES ASSIGNED*/}
            <h1 className="my-1">Employees</h1>
            <EmployeeAssigning selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
            <Button className="my-2 bg-primary text-white w-1/3 hover:bg-indigo-900"> Submit </Button>

          </div>

        </div> 
      </form>
    </div>
  )
  
}
