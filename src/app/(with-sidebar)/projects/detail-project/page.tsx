"use client"
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import TaskTable from "@/app/components/table/task-table";
import ProjectTable from "@/app/components/table/project-assigned-table";
import StatusDropdown from "@/app/components/status-dropdown";
import EmployeeAssigning from "@/app/components/button/employee-assigning";
import { Button } from "@/components/ui/button";

export default function ProjectForm({ onClose }: { onClose: () => void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [position, setPosition] = useState("Status")
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  return (
    <div className="m-8 bg-white">
      <h1 className="my-1 font-poppins font-bold text-2xl">Project Identity</h1>
      <form className="font-poppins space-y-5 mt-8">
      <div className="flex grow gap-8">
          <img src="/kai.png" className="rounded-full max-h-32 max-w-32"></img>

          
          <div className="flex flex-col grow gap-2 space-y-2">
            {/* EMPLOYEE IDENTITY */}
            <div>
              <>Project Name</>
              <Input placeholder="Project Pengembangan Fasilitas Stasiun" disabled/>
            </div>

            <div>
              <>Company/Client</>
              <Input value="PT. KAI" disabled/>
            </div>

            <div>
              <>Project Code</>
              <Input value="PRJ-001" disabled />
            </div>

            <div className="flex flex-row w-full gap-5">
              <div className="w-full">
                <>Project Started</>
                <Input value="1 Maret 2025" disabled/>
              </div>

              <div className="w-full">
                <>Project Ended</>
                <Input value="1 Mei 2025" disabled/>
              </div>
            </div>

            <div>
              <>Project Status</>
              <Input value="Pending" disabled/>
            </div>
            {/* <StatusDropdown position={position} setPosition={setPosition} /> */}

            {/*EMPLOYEES ASSIGNED*/}
            <h1 className="my-1">Employees</h1>
            <EmployeeAssigning selectedItems={selectedItems} setSelectedItems={setSelectedItems} disabled />
                        {/* Project employees */}
                        <div>
              <h1 className="my-2">Employees project</h1>
              <ProjectTable /> {/* Panggil employee table */}
            </div>
          
            {/* Project task */}
            <div>
              <h1 className="my-2">Task List</h1>
              <TaskTable />
            </div>
          </div>

        </div>
         
      </form>
    </div>
  );
}
