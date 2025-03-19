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
  mode?: "add" | "edit";
  onSuccess?: () => void; // Add type for the new prop
}){  
  const [position, setPosition] = useState("");  // Changed from "Status" to empty string
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
      const employeePosition = employee.position || "";
      setPosition(employeePosition);
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
      setPosition("");
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
    if (name === "position") {
      // If changing position field, update position state
      setPosition(value);
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
      alert("Please fill all required fields");
      return;
    }
    
    if (mode === "add" && !formData.password) {
      alert("Password is required for new employees");
      return;
    }
    
    if (!position) {
      alert("Please enter an employee role");
      return;
    }
    
    // Collect all form data
    const employeeData = {
      ...formData,
      position, // Use the position state variable
      status,   // Include the status
      projects: multipleProjects.map(projectName => ({
        projectName,
        position: position || "Member"
      })),
      photoUrl: image !== "/person.png" ? image : null
    };
  
    console.log("Submitting employee data:", employeeData); // Debug log
    
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
        alert(`Error: ${responseData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error in request:", error);
      alert("An error occurred while saving the employee");
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  return (
    <div className="w-full bg-white">
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading project data...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="font-poppins space-y-5">
          <div className="flex grow gap-8">
            {/* Image Upload */}
            <div
              className="relative cursor-pointer group"
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

            <div className="flex flex-col grow gap-2">
              {/* EMPLOYEE IDENTITY */}
              <h1 className="my-1">Employee Identity</h1>
              <Input 
                name="name"
                placeholder="Employee Name" 
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input 
                name="position"
                placeholder="Employee Role" 
                value={position}
                onChange={handleChange}
                required
              />
              <Input 
                name="personnelId"
                placeholder="Employee ID" 
                value={formData.personnelId}
                onChange={handleChange}
                required
              />
              <StatusDropdown status={status} setStatus={setStatus} />

              <h1 className="my-1">Employee Account</h1>
              <Input 
                name="email"
                type="email" 
                placeholder="Employee Email" 
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input 
                name="password"
                type="password" 
                placeholder={mode === "edit" ? "Leave blank to keep current password" : "Password"} 
                value={formData.password}
                onChange={handleChange}
                required={mode === "add"}
              />

              <h1 className="my-2">Project</h1>

              {/* EMPLOYEE PROJECTS */}
              <ProjectAssigning
                options={availableProjects}
                selectedItems={multipleProjects}
                setSelectedItems={setMultipleProjects}
              />

              <Button 
                type="submit"
                className="my-2 bg-primary text-white w-1/3 hover:bg-indigo-900"
              >
                {mode === "add" ? "Submit" : "Update"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}