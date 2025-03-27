"use client"
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import StatusDropdown from "../status-dropdown";
import { Button } from "@/components/ui/button";
import EmployeeAssigning from "../button/employee-assigning";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Define the status type for projects
type ProjectStatus = "Pending" | "Ongoing" | "Completed" | "Delayed";

const projectStatusOptions = [
  { value: "Pending", label: "Pending", color: "text-yellow-500 hover:text-yellow-600 border-yellow-300" },
  { value: "Ongoing", label: "Ongoing", color: "text-blue-500 hover:text-blue-600 border-blue-300" },
  { value: "Completed", label: "Completed", color: "text-emerald-500 hover:text-emerald-600 border-green-300" },
  { value: "Delayed", label: "Delayed", color: "text-red-500 hover:text-red-600 border-red-300" }
];

export default function ProjectForm({ 
  onClose, 
  project = null, 
  mode = "add",
  onSuccess
}: { 
  onClose: () => void; 
  project?: any;
  mode?: "add" | "edit" | "view";
  onSuccess?: () => void;
}) {
  const [status, setStatus] = useState<ProjectStatus>("Pending");
  const [assignedEmployees, setAssignedEmployees] = useState<string[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    projectName: "",
    projectCode: "",
    projectOwner: "",
    startDate: "",
    endDate: ""
  });

  // Fetch employees for assignment
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employee');
        if (response.ok) {
          const data = await response.json();
          setAvailableEmployees(data.map((employee: any) => employee.name));
        } else {
          console.error("Failed to fetch employees");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Populate form when project data is available (for edit mode)
  useEffect(() => {
    if (project) {
      console.log("Setting form data from project:", project);
      
      // Convert dates to YYYY-MM-DD format for input fields
      const startDateFormatted = project.startDate ? 
        new Date(project.startDate).toISOString().split('T')[0] : '';
      const endDateFormatted = project.endDate ? 
        new Date(project.endDate).toISOString().split('T')[0] : '';
      
      setStatus(project.status?.statusName || "Pending");
      setAssignedEmployees(project.employees || []);
      
      setFormData({
        projectName: project.projectName || "",
        projectCode: project.projectCode || "",
        projectOwner: project.projectOwner || "",
        startDate: startDateFormatted,
        endDate: endDateFormatted
      });
    } else {
      // Reset form for add mode
      setStatus("Pending");
      setAssignedEmployees([]);
      setFormData({
        projectName: "",
        projectCode: "",
        projectOwner: "",
        startDate: "",
        endDate: ""
      });
    }
  }, [project]);

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.projectName || !formData.projectCode || !formData.projectOwner) {
      toast.error("Missing required fields", {
        description: "Please fill in all required fields"
      });
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      toast.error("Dates required", {
        description: "Please specify start and end dates"
      });
      return;
    }
    // Validate date range: end date must not be earlier than start date
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate < startDate) {
      toast.error("Invalid date range", {
        description: "End date cannot be earlier than start date"
      });
      return;
    }
    
    const projectData = {
      ...formData,
      status,
      employees: assignedEmployees.map(employeeName => ({
        employeeName: employeeName
      }))
    };
  
    console.log("Submitting project data:", projectData);
    
    try {
      const url = mode === "add" ? "/api/projects" : `/api/projects?id=${project.id}`;
      const method = mode === "add" ? "POST" : "PUT";
  
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
  
      // Get the response data (even if it's an error)
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = {};
      }
      
      if (response.ok) {
        if (mode === "add") {
          toast.success(`Project Added`, {
            description: `${formData.projectName} has been successfully created.`
          });
        } else {
          toast.success(`Project Updated`, {
            description: `${formData.projectName}'s information has been successfully updated.`
          });
        }
        
        // Call the success callback to refresh the project list
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } 
      else {
        console.error("Error saving project:", responseData);
        toast.error(`Error: ${responseData.message || "Unknown error"}`, {
          description: "Please check the form and try again."
        });
      }
    } catch (error) {
      console.error("Error in request:", error);
      toast.error("An error occurred while saving the project");
    }
  };

  return (
    <div className="w-full bg-white">
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading employee data...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="font-poppins space-y-5">
          <div className="flex grow gap-8">
            <div className="w-32 h-32 rounded-full overflow-hidden">
              <img 
                src="/kai.png" 
                alt="Project" 
                className="w-full h-full object-cover" 
              />
            </div>

            <div className="flex flex-col grow gap-4">
              {/* PROJECT INFO */}  
              <div>
                <h1>Project Name</h1>
                <Input 
                  name="projectName"
                  placeholder="Project Name" 
                  value={formData.projectName}
                  onChange={handleChange}
                  required
                  disabled={mode === "view"}
                  className={mode === "view" ? "bg-gray-50" : ""}
                />
              </div>
              <div>
                <h1>Project Owner</h1>
                <Input 
                  name="projectOwner"
                  placeholder="Company/Client" 
                  value={formData.projectOwner}
                  onChange={handleChange}
                  required
                  disabled={mode === "view"}
                  className={mode === "view" ? "bg-gray-50" : ""}
                />
              </div>
              <div>
                <h1>Project Code</h1>
                <Input 
                  name="projectCode"
                  placeholder="Project Code (e.g. PRJ-001)" 
                  value={formData.projectCode}
                  onChange={handleChange}
                  required
                  disabled={mode === "view"}
                  className={mode === "view" ? "bg-gray-50" : ""}
                />
              </div>  
              <div className="flex gap-2">
                <div className="w-1/2">
                <h1>Start Date</h1>
                  <Input 
                    name="startDate"
                    type="date" 
                    placeholder="Start Date" 
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    disabled={mode === "view"}
                    className={mode === "view" ? "bg-gray-50" : ""}    
                  />
                </div>
                <div className="w-1/2">
                  <h1>End Date</h1>
                  <Input 
                    name="endDate"
                    type="date" 
                    placeholder="End Date" 
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    disabled={mode === "view"}
                    className={mode === "view" ? "bg-gray-50" : ""}    
                  />
                </div>
              </div>
              <StatusDropdown 
                status={status} 
                setStatus={(value) => setStatus(value as ProjectStatus)} 
                options={projectStatusOptions}
                disabled={mode === "view"}
                className={mode === "view" ? "bg-gray-50" : ""}
              />

              {/* EMPLOYEES ASSIGNED */}
              <div>
                <h1 className="my-1">Assign Employees</h1>
                <EmployeeAssigning 
                  selectedItems={assignedEmployees} 
                  setSelectedItems={setAssignedEmployees} 
                  disabled={mode === "view"}
                  className={mode === "view" ? "bg-gray-50" : ""}
                />
              </div>

              {mode !== "view" && (
                <Button 
                  type="submit"
                  className="my-2 bg-primary text-white w-1/3 hover:bg-indigo-900"
                >
                  {mode === "add" ? "Submit" : "Update"}
                </Button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}