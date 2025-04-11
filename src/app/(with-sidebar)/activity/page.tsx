"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Plus, Calendar, ListChecks, Check, Copy, X } from "lucide-react";
import { toast } from "sonner";
import ActivityTable from "@/app/components/table/activity";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Project = {
  id: number;
  projectName: string;
};

type Week = {
  id: number;
  weekNum: number;
  startDate: string;
  endDate: string;
};

type Employee = {
  id: number;
  name: string;
  personnelId: string;
};

export default function ActivitiesPage() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role;
  const isManagerOrAdmin = userRole === 'admin' || userRole === 'project_manager';
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // New week creation states
  const [isNewWeekModalOpen, setIsNewWeekModalOpen] = useState(false);
  const [copyPreviousWeek, setCopyPreviousWeek] = useState(true);

  // Fetch projects
  useEffect(() => {
    if (status === 'authenticated') {
      const fetchProjects = async () => {
        try {
          const response = await fetch('/api/projects');
          if (!response.ok) throw new Error('Failed to fetch projects');
          const data = await response.json();
          setProjects(data);
        } catch (error) {
          console.error('Error fetching projects:', error);
          toast.error('Failed to load projects');
        }
      };
      
      fetchProjects();
    }
  }, [status]);
  
  // Fetch weeks when project is selected
  useEffect(() => {
    if (selectedProject) {
      const fetchWeeks = async () => {
        try {
          const response = await fetch(`/api/projects/${selectedProject}/weeks`);
          if (!response.ok) throw new Error('Failed to fetch weeks');
          const data = await response.json();
          setWeeks(data);
          // Auto-select the most recent week if any
          if (data.length > 0) {
            setSelectedWeek(data[0].id);
          }
        } catch (error) {
          console.error('Error fetching weeks:', error);
          toast.error('Failed to load weeks');
        }
      };
      
      fetchWeeks();
    } else {
      setWeeks([]);
      setSelectedWeek(null);
    }
  }, [selectedProject]);
  
  // Fetch employees if user is manager/admin and project is selected
  useEffect(() => {
    if (isManagerOrAdmin && selectedProject) {
      const fetchEmployees = async () => {
        try {
          const response = await fetch(`/api/projects/${selectedProject}/employees`);
          if (!response.ok) throw new Error('Failed to fetch employees');
          const data = await response.json();
          setEmployees(data);
        } catch (error) {
          console.error('Error fetching employees:', error);
          toast.error('Failed to load employees');
        }
      };
      
      fetchEmployees();
    } else {
      setEmployees([]);
      setSelectedEmployee(null);
    }
  }, [isManagerOrAdmin, selectedProject]);
  
  // Create a new activity week
  const createNewWeek = async () => {
    if (!selectedProject) {
      toast.error('Please select a project first');
      return;
    }
    
    try {
      const response = await fetch(`/api/projects/${selectedProject}/weeks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          copyFromPreviousWeek: copyPreviousWeek,
        })
      });
      
      if (!response.ok) throw new Error('Failed to create week');
      
      const newWeek = await response.json();
      setWeeks(prev => [newWeek, ...prev]);
      setSelectedWeek(newWeek.id);
      toast.success('New week created successfully');
      setIsNewWeekModalOpen(false);
    } catch (error) {
      console.error('Error creating week:', error);
      toast.error('Failed to create week');
    }
  };

  const handleAddWeek = () => {
    setIsNewWeekModalOpen(true);
  };
  
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Weekly Activity Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-6 rounded-lg shadow">
        {/* Filter section */}
        <div className="col-span-1 md:col-span-3 space-y-2">
          <label className="block text-sm font-medium text-gray-700">Project</label>
          <select
            className="w-full rounded-md border-gray-300 shadow-sm"
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Select Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.projectName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="col-span-1 md:col-span-3 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Week
            {selectedProject && (
              <Button
                variant="outline"
                size="sm"
                className="ml-2 h-6 w-6 p-0"
                onClick={handleAddWeek}
                title="Add new week"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </label>
          <select
            className="w-full rounded-md border-gray-300 shadow-sm"
            value={selectedWeek || ''}
            onChange={(e) => setSelectedWeek(e.target.value ? parseInt(e.target.value) : null)}
            disabled={!selectedProject || weeks.length === 0}
          >
            <option value="">Select Week</option>
            {weeks.map(week => (
              <option key={week.id} value={week.id}>
                Week {week.weekNum} ({new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
        
        {isManagerOrAdmin && (
          <div className="col-span-1 md:col-span-3 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Employee</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm"
              value={selectedEmployee || ''}
              onChange={(e) => setSelectedEmployee(e.target.value ? parseInt(e.target.value) : null)}
              disabled={!selectedProject || employees.length === 0}
            >
              <option value="">All Employees</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.personnelId})
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="col-span-1 md:col-span-3 flex items-end">
          <Button 
            className="w-full bg-primary text-white hover:bg-primary/90"
            disabled={!selectedWeek}
            onClick={() => setRefreshTrigger(prev => prev + 1)}
          >
            <ListChecks className="mr-2 h-4 w-4" />
            View Activities
          </Button>
        </div>
      </div>
      
      {/* Activities display */}
      {selectedWeek ? (
        <ActivityTable 
          projectId={selectedProject} 
          weekId={selectedWeek} 
          employeeId={selectedEmployee} 
          refreshTrigger={refreshTrigger}
          userRole={userRole}
        />
      ) : (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">Select a project and week to view activities</h3>
          <p className="mt-2 text-sm text-gray-500">
            Activities are organized by week, project, and user
          </p>
        </div>
      )}

      {/* // Update the Dialog content section in your activity page */}
      <Dialog open={isNewWeekModalOpen} onOpenChange={setIsNewWeekModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Week</DialogTitle>
            <DialogDescription>
              Set up a new activity week for the selected project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="copy-previous">Copy activities from previous week</Label>
              <Switch 
                id="copy-previous" 
                checked={copyPreviousWeek} 
                onCheckedChange={setCopyPreviousWeek} 
              />
            </div>
            
            {/* Employee selector has been removed */}
            
            {copyPreviousWeek && (
              <p className="text-xs text-gray-500">
                Activities from the previous week will be copied for all employees in this project.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewWeekModalOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={createNewWeek} className="bg-primary text-white hover:bg-primary/90">
              <Copy className="mr-2 h-4 w-4" />
              Create Week
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}