import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileText, Info, Loader2 } from "lucide-react";

type Checklist = {
  id: number;
  criteria: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function TemplateForm({ 
  onClose, 
  template = null, 
  mode = 'create',
  onSuccess
}: { 
  onClose: () => void;
  template?: any;
  mode?: 'create' | 'edit' | 'view';
  onSuccess?: () => void;
}) {
  const [templateName, setTemplateName] = useState('');
  const [availableChecklists, setAvailableChecklists] = useState<any[]>([]);
  const [selectedChecklists, setSelectedChecklists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCriteria, setNewCriteria] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [newHint, setNewHint] = useState("");
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [filteredChecklists, setFilteredChecklists] = useState<Checklist[]>([]);
  


  // Fetch available checklists
  useEffect(() => {
    const fetchChecklists = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/checklists');
        if (!response.ok) throw new Error('Failed to fetch checklists');
        const data = await response.json();
        setAvailableChecklists(data);
      } catch (error) {
        console.error('Error fetching checklists:', error);
        toast.error('Failed to load checklists');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklists();
  }, []);

  // Populate form with template data when editing
  useEffect(() => {
    if (template && (mode === 'edit' || mode === 'view')) {
      setTemplateName(template.templateName);
      
      // Set selected checklists based on template's existing associations
      if (template.templateChecklists) {
        const selectedIds = template.templateChecklists.map(tc => tc.checklist.id);
        setSelectedChecklists(template.templateChecklists.map(tc => tc.checklist));
      }
    }
  }, [template, mode]);

  const handleToggleChecklist = (checklist) => {
    if (mode === 'view') return; // Don't allow changes in view mode
    
    setSelectedChecklists(prev => {
      const exists = prev.find(item => item.id === checklist.id);
      if (exists) {
        return prev.filter(item => item.id !== checklist.id);
      } else {
        return [...prev, checklist];
      }
    });
  };

  // Add new checklist
  const addNewCriteria = async () => {
    if (!newCriteria.trim()) {
      toast.error("Please enter a criteria");
      return;
    }
    
    setIsSaving(true);
    const tempId = Date.now(); // ID sementara
    
    try {
      // 1. Buat temporary checklist
      const tempChecklist = {
        id: tempId,
        criteria: newCriteria,
        hint: newHint,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
  
      // 2. Optimistic update ke SEMUA state yang relevan
      setAvailableChecklists(prev => [tempChecklist, ...prev]);
      setChecklists(prev => [tempChecklist, ...prev]);
      setFilteredChecklists(prev => [tempChecklist, ...prev]);
  
      // 3. Kirim ke server
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          criteria: newCriteria,
          hint: newHint
        })
      });
  
      if (!response.ok) throw new Error("Failed to create checklist");
  
      // 4. Dapatkan response dari server
      const serverChecklist = await response.json();
  
      // 5. Ganti temporary item dengan data real
      const updateLists = (prev: any[]) => [
        serverChecklist,
        ...prev.filter(item => item.id !== tempId)
      ];
  
      setAvailableChecklists(updateLists);
      setChecklists(updateLists);
      setFilteredChecklists(updateLists);
  
      // 6. Reset form
      setNewCriteria("");
      setNewHint("");
      toast.success("Checklist added successfully");
  
    } catch (error) {
      // 7. Rollback jika error
      const removeTemp = (prev: any[]) => prev.filter(item => item.id !== tempId);
      setAvailableChecklists(removeTemp);
      setChecklists(removeTemp);
      setFilteredChecklists(removeTemp);
      
      console.error("Error adding checklist:", error);
      toast.error("Failed to add checklist");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'view') return;
    
    if (!templateName.trim()) {
      toast.error('Template name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const checklistIds = selectedChecklists.map(cl => cl.id);
      const url = mode === 'create' ? '/api/templates' : `/api/templates?id=${template.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateName,
          checklistIds
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      toast.success(mode === 'create' ? 'Template created successfully' : 'Template updated successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Template Name</label>
        <Input 
          value={templateName} 
          onChange={(e) => setTemplateName(e.target.value)}
          disabled={mode === 'view' || isSubmitting}
          placeholder="Enter template name"
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Checklists</label>
        {isLoading ? (
          <div className="text-center py-4">Loading checklists...</div>
        ) : (
          <div className="border rounded-md max-h-60 overflow-y-auto p-2">
            {availableChecklists.map(checklist => (
              <div key={checklist.id} className="flex items-center p-2 hover:bg-gray-50">
                <input 
                  type="checkbox"
                  id={`checklist-${checklist.id}`}
                  checked={selectedChecklists.some(item => item.id === checklist.id)}
                  onChange={() => handleToggleChecklist(checklist)}
                  disabled={mode === 'view' || isSubmitting}
                  className="mr-2"
                />
                <label 
                  htmlFor={`checklist-${checklist.id}`}
                  className="cursor-pointer flex-1 text-sm"
                >
                  {checklist.criteria}
                </label>
              </div>
            ))}
            {availableChecklists.length === 0 && (
              <p className="text-center py-2 text-gray-500">No checklists available</p>
            )}
          </div>
        )}
      </div>

      {/* Add new checklist */}
      <div className="space-y-2">
          <Input
            type="text"
            placeholder="New check criteria"
            value={newCriteria}
            onChange={(e) => setNewCriteria(e.target.value)}

          />
          <div className="flex items-center gap-2">
            <Info className="text-gray-400" size={16} />
            <Input
              type="text"
              placeholder="Hint"
              value={newHint}
              onChange={(e) => setNewHint(e.target.value)}
              className="flex-grow"
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

      {mode !== 'view' && (
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            className="text-white"
            type="submit" 
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      )}
      
      {mode === 'view' && (
        <div className="flex justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      )}
    </form>
  );
}