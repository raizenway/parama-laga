"use client";
import { Input } from "@/components/ui/input";
import EmployeeModal from "@/app/components/modal/employee-modal";
import { useState } from "react";
import AddButton from "@/app/components/button/button";
import EmployeeTable from "@/app/components/table/employee-table";

export default function Page() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <div className="mx-8 h-screen flex-wrap space-y-5">
      <div className="mt-12 grow">
        <div className="font-poppins font-bold text-2xl">Employees</div>
          <div className="flex justify-end items-center gap-3">
            <Input className="w-72" type="email" placeholder="Search" />
            <AddButton text="+ Add Employee" onClick={() => setIsDetailOpen(true)} />
          </div>

          <div className="grow h-96 bg-white rounded-2xl flex justify-center items-start p-4">
            <div className="max-h-full w-full">
              <EmployeeTable />
            </div>
          </div>
        </div>

      {/* Employee Modal */}
      <EmployeeModal open={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
    </div>
  );
}
