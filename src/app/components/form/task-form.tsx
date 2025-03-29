"use client"
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SingleSelection from "../dropdown-single-selection";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

// Types
type DocumentType = {
  id: number;
  name: string;
};

type Project = {
  id: number;
  projectName: string;
};

type Template = {
  id: number;
  templateName: string;
};

type Employee = {
  id: number;
  name: string;
};

export default function TaskForm({onClose, onSuccess} : {onClose: () => void, onSuccess?: () => void}) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  const userName = (session?.user as any)?.name;
  const isEmployee = userRole !== 'admin' && userRole !== 'project_manager';


  // Form data state
  const [formData, setFormData] = useState({
    taskName: "",
    documentTypeId: "",
    templateId: "",
    projectId: "",
    userId: userId || "",
    iteration: 1
  });
  
  // Dropdown options state
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  // Selected items for dropdowns
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(isEmployee ? userName : null);

  // Fetch all necessary data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        
        // Fetch document types
        const docTypeRes = await fetch('/api/document-types');
        if (docTypeRes.ok) {
          const docTypes = await docTypeRes.json();
          setDocumentTypes(docTypes);
        }
        
        // Fetch projects
        const projectRes = await fetch('/api/projects');
        if (projectRes.ok) {
          const projects = await projectRes.json();
          setProjects(projects);
        }
        
        // Fetch templates
        const templateRes = await fetch('/api/templates');
        if (templateRes.ok) {
          const templates = await templateRes.json();
          setTemplates(templates);
        }
        
        // Only fetch employees if user is admin or project manager
        if (!isEmployee) {
          // Fetch employees (users)
          const employeeRes = await fetch('/api/employee');
          if (employeeRes.ok) {
            const employees = await employeeRes.json();
            setEmployees(employees);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load form data");
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchData();
  }, [isEmployee]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Effect to update formData when dropdown selections change
  useEffect(() => {
    if (selectedDocType) {
      const docType = documentTypes.find(dt => dt.name === selectedDocType);
      if (docType) setFormData(prev => ({ ...prev, documentTypeId: docType.id.toString() }));
    }
    
    if (selectedProject) {
      const project = projects.find(p => p.projectName === selectedProject);
      if (project) setFormData(prev => ({ ...prev, projectId: project.id.toString() }));
    }
    
    if (selectedTemplate) {
      const template = templates.find(t => t.templateName === selectedTemplate);
      if (template) setFormData(prev => ({ ...prev, templateId: template.id.toString() }));
    }
    
    // If user is not employee, update selected employee as usual
    if (!isEmployee && selectedEmployee) {
      const employee = employees.find(e => e.name === selectedEmployee);
      if (employee) setFormData(prev => ({ ...prev, userId: employee.id.toString() }));
    }
  }, [selectedDocType, selectedProject, selectedTemplate, selectedEmployee, documentTypes, projects, templates, employees, isEmployee]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.taskName) {
      toast.error("Task name is required");
      return;
    }
    
    if (!formData.documentTypeId) {
      toast.error("Document type is required");
      return;
    }
    
    if (!formData.templateId) {
      toast.error("Template is required");
      return;
    }
    
    if (!formData.projectId) {
      toast.error("Project is required");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Task created successfully");
        if (onSuccess){
          onSuccess();
        } 
        onClose();
      } else {
        toast.error(`Failed to create task: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetching) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading form data...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="taskName" className="block text-sm font-medium">Task Name</label>
          <Input 
            id="taskName" 
            name="taskName" 
            value={formData.taskName} 
            onChange={handleChange} 
            className="w-full"
            placeholder="Enter task name"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Document Type</label>
          <SingleSelection 
            options={documentTypes.map(dt => dt.name)}
            selectedItem={selectedDocType}
            setSelectedItem={setSelectedDocType}
            placeholder="Select document type"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Template</label>
          <SingleSelection 
            options={templates.map(t => t.templateName)}
            selectedItem={selectedTemplate}
            setSelectedItem={setSelectedTemplate}
            placeholder="Select template"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Project</label>
          <SingleSelection 
            options={projects.map(p => p.projectName)}
            selectedItem={selectedProject}
            setSelectedItem={setSelectedProject}
            placeholder="Select project"
          />
        </div>
        
        {/* Only show employee selection for admins and project managers */}
        {!isEmployee ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Assign to Employee</label>
            <SingleSelection 
              options={employees.map(e => e.name)}
              selectedItem={selectedEmployee}
              setSelectedItem={setSelectedEmployee}
              placeholder="Select employee"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Assign to Employee</label>
            <Input 
              value={userName || "You"}
              className="bg-gray-50"
              readOnly
            />
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="iteration" className="block text-sm font-medium">Iteration</label>
          <Input 
            id="iteration" 
            name="iteration" 
            type="number" 
            min="1" 
            value={formData.iteration} 
            onChange={handleChange} 
            className="w-full"
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="text-white bg-primary hover:bg-primary-dark">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Task'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}