"use client"
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import StatusDropdown from "../status-dropdown";
import ProjectAssigning from "../dropdown-multiple-selection";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Define the status type based on Prisma schema
type UserStatus = "active" | "inactive";

export default function EmployeeForm({ 
  onClose, 
  employee = null, 
  mode = "add",
  onSuccess // New prop
}: { 
  onClose: () => void; 
  employee?: any;
  mode?: "add" | "edit" | "view";
  onSuccess?: () => void; // Add type for the new prop
}){  
  // Project-specific positions
  const [projectPositions, setProjectPositions] = useState<Record<string, string>>({});
  // This will be stored in User.role field
  const [defaultRole, setDefaultRole] = useState("");
  const [status, setStatus] = useState<UserStatus>("active");
  const [image, setImage] = useState("/person.png");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [multipleProjects, setMultipleProjects] = useState<string[]>([]);
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    personnelId: "",
    password: ""
  });

  // Update project positions when projects change
  useEffect(() => {
    const newPositions = { ...projectPositions };
    
    // Add positions for new projects
    multipleProjects.forEach(project => {
      if (!newPositions[project]) {
        newPositions[project] = defaultRole; // Use default role as initial position
      }
    });
    
    // Remove positions for removed projects
    Object.keys(newPositions).forEach(project => {
      if (!multipleProjects.includes(project)) {
        delete newPositions[project];
      }
    });
    
    setProjectPositions(newPositions);
  }, [multipleProjects, defaultRole]);

  // Fetch projects from the database
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          setAvailableProjects(data.map((project: any) => project.projectName));
        } else {
          console.error("Failed to fetch projects");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Populate form when employee data is available
  useEffect(() => {
    if (employee) {
      console.log("Setting form data from employee:", employee);
      
      // Extract positions from employee data
      const positions: Record<string, string> = {};
      
      // Use role field from User table
      const role = employee.role || "";
      setDefaultRole(role);
      
      // If employee has project-specific positions in the data
      if (employee.projectUsers && employee.projectUsers.length > 0) {
        employee.projectUsers.forEach((pu: any) => {
          positions[pu.project] = pu.position || role;
        });
      } else if (employee.projects) {
        // For backward compatibility
        employee.projects.forEach((project: string) => {
          positions[project] = role;
        });
      }
      
      setProjectPositions(positions);
      setImage(employee.photoUrl || "/person.png");
      setMultipleProjects(employee.projects || []);
      
      if (employee.status && (employee.status === "active" || employee.status === "inactive")) {
        setStatus(employee.status);
      }
      
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        personnelId: employee.personnelId || "",
        password: ""
      });
    } else {
      setDefaultRole("");
      setProjectPositions({});
      setImage("/person.png");
      setMultipleProjects([]);
      setStatus("active");
      setFormData({
        name: "",
        email: "",
        personnelId: "",
        password: ""
      });
    }
  }, [employee]);

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "defaultRole") {
      setDefaultRole(value);
    } else {
      // Update other form fields
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.email || !formData.personnelId) {
      toast.error("Missing required fields", {
        description: "Please fill in all required fields"
      });
      return;
    }
    
    if (mode === "add" && !formData.password) {
      toast.error("Password required", {
        description: "Password is required for new employees"
      });
      return;
    }
    
    // Check if any project is missing a position
    const missingPositions = multipleProjects.filter(project => 
      !projectPositions[project] || projectPositions[project].trim() === ""
    );
    
    if (missingPositions.length > 0) {
      toast.error("Missing project roles", {
        description: `Please enter roles for all projects: ${missingPositions.join(", ")}`
      });
      return;
    }
    
    // Collect all form data
    const employeeData = {
      ...formData,
      role: defaultRole, // This will be stored in User.role field
      status,   // Include the status
      projects: multipleProjects.map(projectName => ({
        projectName,
        position: projectPositions[projectName] // Project-specific position
      })),
      photoUrl: image !== "/person.png" ? image : null
    };
  
    console.log("Submitting employee data:", employeeData);
    
    try {
      const url = mode === "add" ? "/api/employee" : `/api/employee?id=${employee.id}`;
      const method = mode === "add" ? "POST" : "PUT";
  
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employeeData)
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
          toast.success(`Employee Added`, {
            description: `${formData.name} has been successfully added to the system.`
          });
        } else {
          toast.success(`Employee Updated`, {
            description: `${formData.name}'s information has been successfully updated.`
          });
        }
        console.log("Employee saved successfully:", responseData);
        // Call the success callback to refresh the employee list
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } 
      else {
        console.error("Error saving employee:", responseData);
        toast.error(`Error: ${responseData.message || "Unknown error"}`, {
          description: "Please check your form data and try again."
        });
      }
    } catch (error) {
      console.error("Error in request:", error);
      toast.error("Network Error", {
        description: "An error occurred while saving the employee data."
      });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const userStatusOptions = [
    { value: "active", label: "Active", color: "text-emerald-500 hover:text-emerald-600 border-green-300" },
    { value: "inactive", label: "Inactive", color: "text-red-500 hover:text-red-600 border-red-300" }
  ];

  return (
    <div className="w-full bg-white">
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading project data...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="font-poppins">
          <div className="flex grow gap-8">
            {/* Image Upload */}
            <div
              className="relative cursor-pointer group shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={image}
                alt="Employee"
                className="rounded-full h-32 w-32 border border-gray-300"
              />
              <div className="absolute inset-0 h-32 w-32 bg-opacity-50 rounded-full hidden group-hover:flex items-center justify-center hover:bg-black hover:bg-opacity-50 hover:transition">
                <span className="text-white text-xs">Change Photo</span>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div className="flex flex-col grow gap-2 max-h-[70vh] overflow-y-auto pr-2">
              {/* EMPLOYEE IDENTITY */}
              <h1 className="my-1 text-base font-medium">Employee Identity</h1>
              <Input 
                name="name"
                placeholder="Employee Name" 
                value={formData.name}
                onChange={handleChange}
                required
                disabled={mode === "view"}
                className={mode === "view" ? "bg-gray-50" : ""}
              />
              <Input 
                name="defaultRole"
                placeholder="Employee Role" 
                value={defaultRole}
                onChange={handleChange}
                required
                disabled={mode === "view"}
                className={mode === "view" ? "bg-gray-50" : ""}
              />
              <Input 
                name="personnelId"
                placeholder="Employee ID" 
                value={formData.personnelId}
                onChange={handleChange}
                required
                disabled={mode === "view"}
                className={mode === "view" ? "bg-gray-50" : ""}
              />
              <StatusDropdown 
                status={status} 
                setStatus={setStatus} 
                options={userStatusOptions} 
                label="Employee Status"
                disabled={mode === "view"}
                className={mode === "view" ? "bg-gray-50" : ""} 
              />

              <h1 className="my-1 mt-3 text-base font-medium">Employee Account</h1>
              <Input 
                name="email"
                type="email" 
                placeholder="Employee Email" 
                value={formData.email}
                onChange={handleChange}
                required
                disabled={mode === "view"}
                className={mode === "view" ? "bg-gray-50" : ""}
              />


              <h1 className="my-1 mt-3 text-base font-medium">Project Assignment</h1>

              {/* EMPLOYEE PROJECTS */}
              <ProjectAssigning
                options={availableProjects}
                selectedItems={multipleProjects}
                setSelectedItems={setMultipleProjects}
                disabled={mode=== "view"} // Disable selection in view mode
                className={mode === "view" ? "bg-gray-50" : ""}
              />
              {multipleProjects.length <= 0 && (
                <div className="text-amber-500 text-sm mb-2">
                  Please select at least one project to assign roles.
                </div>
              )}              
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