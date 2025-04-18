import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Info, Loader2 } from "lucide-react";

type Checklist = {
  id: number;
  criteria: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function TemplateForm({ 
  onClose,
  onSuccess = () => {}, 
  template = undefined, 
  mode = 'create'
}: { 
  onClose: () => void;
  onSuccess?: () => void;
  template?: {
    id?: number;
    templateName: string;
    templateChecklists?: { checklist: Checklist }[];
  };
  mode?: 'create' | 'edit' | 'view';
}) {
  const [templateName, setTemplateName] = useState('');
  const [availableChecklists, setAvailableChecklists] = useState<Checklist[]>([]);
  const [selectedChecklists, setSelectedChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCriteria, setNewCriteria] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [newHint, setNewHint] = useState("");
  


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
        setSelectedChecklists(template.templateChecklists.map(tc => tc.checklist));
      }
    }
  }, [template, mode]);

  const handleToggleChecklist = (checklist: Checklist) => {
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
      const updateLists = (prev: Checklist[]) => [
        serverChecklist,
        ...prev.filter(item => item.id !== tempId)
      ];

      setAvailableChecklists(updateLists);
      setNewCriteria("");
      setNewHint("");
      toast.success("Checklist added successfully");
    } catch {
      const removeTemp = (prev: Checklist[]) => prev.filter(item => item.id !== tempId);
      setAvailableChecklists(removeTemp);
      toast.error("Failed to add checklist");
    } finally {
      setIsSaving(false);
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mode === 'view') return;
    setIsSubmitting(true);
  
    try {
      const url =
        mode === 'create'
          ? '/api/templates'
          : `/api/templates/${template?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
  
      const body = {
        templateName,
        checklistIds: selectedChecklists.map((c) => c.id.toString()),
      };
  
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save template');
      }
  
      toast.success(mode === 'create' ? 'Template created!' : 'Template updated!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error', {
        description: (error as Error).message,
      });
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
      {mode !== 'view' && (
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
        )}

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