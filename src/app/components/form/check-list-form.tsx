"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash, Check, Loader2, Info, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

type Checklist = {
  id: number;
  criteria: string;
  hint?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function CheckListForm({ onClose }: { onClose: () => void }) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChecklists, setFilteredChecklists] = useState<Checklist[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCriteria, setNewCriteria] = useState("");
  const [newHint, setNewHint] = useState("");
  const [editingValues, setEditingValues] = useState<{
    criteria: string;
    hint: string;
  }>({ criteria: "", hint: "" });

  // Fetch checklists
  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        const response = await fetch('/api/checklists');
        if (!response.ok) throw new Error("Failed to fetch checklists");
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
  
  // Filter checklists
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

  // Add new checklist with hint
  const addNewCriteria = async () => {
    if (!newCriteria.trim()) {
      toast.error("Please enter a criteria");
      return;
    }
    
    setIsSaving(true);
    try {
      const tempId = Date.now();
      
      const tempChecklist = {
        id: tempId,
        criteria: newCriteria,
        hint: newHint,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setChecklists([tempChecklist, ...checklists]);
      setFilteredChecklists([tempChecklist, ...filteredChecklists]);
      
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          criteria: newCriteria,
          hint: newHint
        })
      });
      
      if (!response.ok) throw new Error("Failed to create checklist");
      
      const serverChecklist = await response.json();
      
      setChecklists([
        serverChecklist,
        ...checklists.filter(c => c.id !== tempId)
      ]);
      
      setFilteredChecklists([
        serverChecklist, 
        ...filteredChecklists.filter(c => c.id !== tempId)
      ]);
      
      setNewCriteria("");
      setNewHint("");
      toast.success("Checklist added successfully");
    } catch (error) {
      setChecklists(checklists.filter(c => c.id !== tempId));
      setFilteredChecklists(filteredChecklists.filter(c => c.id !== tempId));
      console.error("Error adding checklist:", error);
      toast.error("Failed to add checklist");
    } finally {
      setIsSaving(false);
    }
  };

  // Start editing
  const startEditing = (checklist: Checklist) => {
    setEditingId(checklist.id);
    setEditingValues({
      criteria: checklist.criteria,
      hint: checklist.hint || ""
    });
  };

  // Update checklist
const updateCriteria = async (id: number) => {
  if (!editingValues.criteria.trim()) {
    toast.error("Criteria cannot be empty");
    return;
  }
  
  try {
    const response = await fetch(`/api/checklists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        criteria: editingValues.criteria,
        hint: editingValues.hint,
        updatedAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) throw new Error("Failed to update checklist");
    
    const updatedChecklist = await response.json();
    
    // Update checklists utama
    const updatedChecklists = checklists.map(cl => 
      cl.id === updatedChecklist.id ? updatedChecklist : cl
    ).sort((a, b) => 
      new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
    
    // Update filteredChecklists berdasarkan searchTerm
    const updatedFiltered = updatedChecklists.filter(
      checklist => checklist.criteria.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setChecklists(updatedChecklists);
    setFilteredChecklists(updatedFiltered);
    
    setEditingId(null);
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
        placeholder="🔍︎ Search check criteria" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border border-tersier rounded-md outline-none focus:border-indigo-400"
      />
      
      <div className=" space-y-2">
        <div className="max-h-80 overflow-y-auto border border-gray-300 p-2 rounded-lg">
          {filteredChecklists.length > 0 ? (
            filteredChecklists.map((checklist) => (
              <div key={checklist.id} className="mb-4 space-y-2">
                <div className="flex items-center gap-3">
                  {/* Criteria Show */}
                  <CheckCircle className="text-lime-600" size={20}/>
                  <Input
                    type="text"
                    value={editingId === checklist.id ? editingValues.criteria : checklist.criteria}
                    placeholder="Check Criteria"
                    onChange={(e) => {
                      if (editingId === checklist.id) {
                        setEditingValues({
                          ...editingValues,
                          criteria: e.target.value
                        });
                      }
                    }}
                    onFocus={() => startEditing(checklist)}
                    className="w-full p-2 border border-tersier rounded-md outline-none focus:border-indigo-400"
                  />
                  
                  {/* Action Buttons */}
                  {editingId === checklist.id && (
                    <button
                      type="button"
                      onClick={() => updateCriteria(checklist.id)}
                      className="p-1 rounded-md bg-green-500 text-white hover:bg-green-700"
                      title="Save changes"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => removeChecklist(checklist.id)}
                    className="p-1 rounded-md bg-red-500 text-white hover:bg-red-700"
                    title="Delete checklist"
                  >
                    <Trash size={16} />
                  </button>
                </div>
                
                {/* Hint Show */}
                <div className="flex items-center gap-3">
                  <Info className="text-gray-400" size={16} />
                  <Input
                    type="text"
                    value={editingId === checklist.id ? editingValues.hint : checklist.hint || ""}
                    placeholder="Hint"
                    onChange={(e) => {
                      if (editingId === checklist.id) {
                        setEditingValues(prev => ({
                          ...prev,
                          hint: e.target.value
                        }));
                      }
                    }}
                    onFocus={() => startEditing(checklist)}
                    className="w-full p-2 border border-tersier rounded-md outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              {searchTerm ? "No checklists match your search" : "No checklists available"}
            </div>
          )}
        </div>

        {/* Add new checklist section */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="New check criteria"
            value={newCriteria}
            onChange={(e) => setNewCriteria(e.target.value)}
            className="w-full p-2 border text-sm border-tersier rounded-md outline-none focus:border-indigo-400"
          />
          <div className="flex items-center gap-2">
            <Info className="text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Hint (optional)"
              value={newHint}
              onChange={(e) => setNewHint(e.target.value)}
              className="w-full p-2 border text-sm border-tersier rounded-md outline-none focus:border-indigo-400"
            />
          </div>
          <Button
            type="button"
            onClick={addNewCriteria}
            className="bg-blue-600 text-white hover:bg-blue-800 w-full"
            disabled={isSaving || !newCriteria.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add New Checklist"
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