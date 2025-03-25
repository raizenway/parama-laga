"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Checklist = {
  id: number;
  criteria: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function CheckListForm({ onClose }: { onClose: () => void }) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChecklists, setFilteredChecklists] = useState<Checklist[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newCriteria, setNewCriteria] = useState("");

  // Fetch checklists
  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        const response = await fetch('/api/checklists');
        
        if (!response.ok) {
          throw new Error("Failed to fetch checklists");
        }
        
        const data = await response.json();
        setChecklists(data);
        setFilteredChecklists(data);
      } catch (error) {
        console.error("Error fetching checklists:", error);
        toast.error("Failed to load checklists");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChecklists();
  }, []);
  
  // Filter checklists when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredChecklists(checklists);
      return;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = checklists.filter(
      checklist => checklist.criteria.toLowerCase().includes(lowerCaseSearch)
    );
    
    setFilteredChecklists(filtered);
  }, [searchTerm, checklists]);

  // Add new checklist
  const addNewCriteria = async () => {
    if (!newCriteria.trim()) {
      toast.error("Please enter a criteria");
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          criteria: newCriteria
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to create checklist");
      }
      
      const newChecklist = await response.json();
      setChecklists([...checklists, newChecklist]);
      setFilteredChecklists([...filteredChecklists, newChecklist]);
      setNewCriteria("");
      toast.success("Checklist added successfully");
    } catch (error) {
      console.error("Error adding checklist:", error);
      toast.error("Failed to add checklist");
    } finally {
      setIsSaving(false);
    }
  };

  // Update checklist
  const updateCriteria = async (checklist: Checklist, newValue: string) => {
    if (!newValue.trim()) {
      toast.error("Criteria cannot be empty");
      return;
    }
    
    if (newValue === checklist.criteria) {
      setEditingIndex(null);
      return;
    }
    
    try {
      const response = await fetch(`/api/checklists/${checklist.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          criteria: newValue
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to update checklist");
      }
      
      const updatedChecklist = await response.json();
      
      setChecklists(checklists.map(cl => 
        cl.id === updatedChecklist.id ? updatedChecklist : cl
      ));
      
      setFilteredChecklists(filteredChecklists.map(cl => 
        cl.id === updatedChecklist.id ? updatedChecklist : cl
      ));
      
      setEditingIndex(null);
      toast.success("Checklist updated successfully");
    } catch (error) {
      console.error("Error updating checklist:", error);
      toast.error("Failed to update checklist");
    }
  };

  // Delete checklist
  const removeChecklist = async (id: number) => {
    try {
      const response = await fetch(`/api/checklists/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete checklist");
      }
      
      setChecklists(checklists.filter(cl => cl.id !== id));
      setFilteredChecklists(filteredChecklists.filter(cl => cl.id !== id));
      toast.success("Checklist deleted successfully");
    } catch (error: any) {
      console.error("Error deleting checklist:", error);
      toast.error(error.message || "Failed to delete checklist");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading checklists...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-5 rounded-lg shadow-md space-y-3">
      <Input 
        type="search" 
        placeholder="Search check criteria" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <div className="font-poppins space-y-4">
        {/* Container with height limit and overflow */}
        <div className="max-h-80 overflow-y-auto border border-gray-300 p-2 rounded-lg">
          {filteredChecklists.length > 0 ? (
            filteredChecklists.map((checklist) => (
              <div key={checklist.id} className="flex items-center gap-3 mb-2">
                <Input
                  type="text"
                  value={editingIndex === checklist.id ? newCriteria : checklist.criteria}
                  placeholder="Check Criteria"
                  onChange={(e) => {
                    if (editingIndex === checklist.id) {
                      setNewCriteria(e.target.value);
                    }
                  }}
                  onFocus={() => {
                    if (editingIndex !== checklist.id) {
                      setEditingIndex(checklist.id);
                      setNewCriteria(checklist.criteria);
                    }
                  }}
                  className="flex-grow"
                />
                
                {/* Edit confirmation button */}
                {editingIndex === checklist.id && (
                  <button
                    type="button"
                    onClick={() => updateCriteria(checklist, newCriteria)}
                    className="p-1 rounded-md bg-green-500 text-white hover:bg-green-700"
                    title="Save changes"
                  >
                    <Check size={16} />
                  </button>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeChecklist(checklist.id)}
                  className="p-1 rounded-md bg-red-500 text-white hover:bg-red-700"
                  title="Delete checklist"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              {searchTerm ? "No checklists match your search" : "No checklists available"}
            </div>
          )}
        </div>

        {/* Add new checklist */}
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="New check criteria"
            value={newCriteria}
            onChange={(e) => setNewCriteria(e.target.value)}
            className="flex-grow"
          />
          <Button
            type="button"
            onClick={addNewCriteria}
            className="bg-blue-600 text-white hover:bg-blue-800"
            disabled={isSaving || !newCriteria.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "+ Add"
            )}
          </Button>
        </div>

        <Button 
          type="button" 
          onClick={onClose} 
          className="mt-2 bg-primary text-white hover:bg-indigo-900 w-full"
        >
          Done
        </Button>
      </div>
    </div>
  );
}