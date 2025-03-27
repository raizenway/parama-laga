import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
                  className="cursor-pointer flex-1"
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