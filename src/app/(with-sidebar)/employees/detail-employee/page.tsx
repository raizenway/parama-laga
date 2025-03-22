"use client"
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import TaskTable from "@/app/components/table/task-table";
import ProjectTable from "@/app/components/table/project-assigned-table";

export default function EmployeeForm({ onClose }: { onClose: () => void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  return (
    <div className="m-8 bg-white">
      <h1 className="my-1 font-poppins font-bold text-2xl">Employee Identity</h1>
      <form className="font-poppins space-y-5 mt-8">
        <div className="flex grow gap-8">
          {/* Image Upload */}
          <div
            className="relative cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <img
              src="/person.png"
              alt="Employee"
              className="rounded-full h-32 w-32 border border-gray-300"
            />
          </div>

          <div className="flex flex-col grow gap-2 space-y-2">
            {/* EMPLOYEE IDENTITY */}
            <div>
              <>Employee Name</>
              <Input placeholder="Employee Name" />
            </div>
            <div>
              <>Employee Position</>
              <Input value="Position"/>
            </div>
            <div>
              <>Employee ID</>
              <Input value="KO123" />
            </div>
            <div>
              <>Employee Status</>
              <Input value="Aktif" />
            </div>
            {/* <StatusDropdown position={position} setPosition={setPosition} /> */}

            <div className="space-y-3">
              <h1 className="my-1">Employee Account</h1>
              <Input type="email" placeholder="Email pegawai" />
              <Input type="password" id="password" placeholder="******" />
            </div>
            
            {/* EMPLOYEE PROJECTS */}
            <div>
              <h1 className="my-2">Project Assigned</h1>
              <ProjectTable />
            </div>
          
            {/* EMPLOYEE TASK */}
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
