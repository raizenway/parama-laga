"use client"
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import TaskTable from "@/app/components/table/task-table";
import ProjectTable from "@/app/components/table/project-assigned-table";
import { Loader2, ArrowLeft, Mail, User, CalendarDays, BadgeCheck, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

type Employee = {
  id: string;
  name: string;
  email: string;
  personnelId: string;
  photoUrl: string | null;
  role: string;
  status: string;
  projects: string[];
  dateAdded: string;
};

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setIsLoading(true);
        const employeeId = params.id;
        const response = await fetch(`/api/employee/${employeeId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch employee data: ${response.status}`);
        }
        
        const data = await response.json();
        setEmployee(data);
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchEmployee();
    }
  }, [params.id]);

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading employee data...</span>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error || "Employee not found"}</p>
        <Button onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h1 className=" font-bold text-2xl">Employee Details</h1>
        <Button onClick={handleBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Back
        </Button>
      </div>
      
      {/* Employee details section - alternative to Card */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="">
            <div className="flex flex-wrap md:flex-nowrap gap-8">
              {/* Employee Photo */}
              <div className="shrink-0 flex flex-col items-center">
                <img
                  src={employee.photoUrl || "/person.png"}
                  alt={employee.name}
                  className="rounded-full h-36 w-36 border border-gray-300 object-cover shadow-sm"
                />
                <div className="mt-4 text-center">
                  {/* Alternative to Badge */}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    employee.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {employee.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col grow space-y-5 w-full">
                {/* EMPLOYEE IDENTITY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User size={18} />
                      <label className="text-sm font-medium">Employee Name</label>
                    </div>
                    <Input value={employee.name} readOnly className="bg-gray-50" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase size={18} />
                      <label className="text-sm font-medium">Employee Role</label>
                    </div>
                    <Input value={employee.role} readOnly className="bg-gray-50" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BadgeCheck size={18} />
                      <label className="text-sm font-medium">Employee ID</label>
                    </div>
                    <Input value={employee.personnelId} readOnly className="bg-gray-50" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarDays size={18} />
                      <label className="text-sm font-medium">Date Added</label>
                    </div>
                    <Input 
                      value={new Date(employee.dateAdded).toLocaleDateString('en-US', {
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                      })} 
                      readOnly 
                      className="bg-gray-50" 
                    />
                  </div>
                </div>

                {/* EMPLOYEE ACCOUNT */}
                <div className="pt-2">
                  <h2 className="text-lg font-semibold mb-3">Employee Account</h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={18} />
                      <label className="text-sm font-medium">Email</label>
                    </div>
                    <Input value={employee.email} readOnly className="bg-gray-50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* EMPLOYEE PROJECTS */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Briefcase size={20} />
          Project Assignments
        </h2>
        {/* Alternative to Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6">
            <ProjectTable employeeId={employee.id} />
          </div>
        </div>
      </div>
    
      {/* EMPLOYEE TASK */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CalendarDays size={20} />
          Task Assignments
        </h2>
        {/* Alternative to Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6">
            <TaskTable employeeId={employee.id} hideAssignedColumn={true}/>
          </div>
        </div>
      </div>
    </div>
  );
}