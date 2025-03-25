"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CheckList from "../button/check-list";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Checklist = {
  id: number;
  criteria: string;
};

type Template = {
  id: number;
  templateName: string;
  templateChecklists: {
    id: number;
    templateId: number;
    checklistId: number;
    checklist: Checklist;
  }[];
};

type TemplateFormProps = {
  onClose: () => void;
  template?: Template;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
};

export default function TemplateForm({ onClose, template, mode, onSuccess }: TemplateFormProps) {
  const [templateName, setTemplateName] = useState(template?.templateName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [allChecklists, setAllChecklists] = useState<Checklist[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [checklistsLoading, setChecklistsLoading] = useState(true);
  
  // Fetch all available checklists
  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        setChecklistsLoading(true);
        const response = await fetch('/api/checklists');
        
        if (!response.ok) {
          throw new Error("Failed to fetch checklists");
        }
        
        const data = await response.json();
        setAllChecklists(data);

        // If we're in edit or view mode, select the checklists that are already assigned to the template
        if ((mode === 'edit' || mode === 'view') && template) {
          const selectedCriteria = template.templateChecklists.map(
            tc => tc.checklist.criteria
          );
          setSelectedItems(selectedCriteria);
        }
      } catch (error) {
        console.error("Error fetching checklists:", error);
        toast.error("Error", {
          description: "Failed to load checklist items."
        });
      } finally {
        setChecklistsLoading(false);
      }
    };

    fetchChecklists();
  }, [mode, template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!templateName.trim()) {
      toast.error("Error", {
        description: "Template name is required."
      });
      return;
    }
    
    if (selectedItems.length === 0) {
      toast.error("Error", {
        description: "Please select at least one checklist item."
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Map selected criteria back to checklist IDs
      const checklistIds = allChecklists
        .filter(cl => selectedItems.includes(cl.criteria))
        .map(cl => cl.id);
      
      const endpoint = mode === 'create' 
        ? '/api/templates' 
        : `/api/templates/${template?.id}`;
        
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateName,
          checklistIds,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${mode} template`);
      }
      
      toast.success(`Template ${mode === 'create' ? 'created' : 'updated'} successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(`Error ${mode}ing template:`, error);
      toast.error("Error", {
        description: `Failed to ${mode} template. Please try again.`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (checklistsLoading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // For view mode, display a read-only version
  if (mode === 'view') {
    return (
      <div className="w-full bg-white">
        <div className="font-poppins space-y-5">
          <div className="flex grow gap-8">
            <div className="flex flex-col grow gap-2">
              {/* TEMPLATE IDENTITY */}
              <label className="font-medium">Template Name</label>
              <div className="p-2 border rounded-md bg-gray-50">
                {templateName}
              </div>
              
              {/* CHECK LIST ITEMS */}
              <h1 className="mt-4 mb-1 font-medium">Check List Items ({selectedItems.length})</h1>
              <div className="max-h-80 overflow-y-auto border border-gray-300 p-2 rounded-lg space-y-1">
                {selectedItems.length > 0 ? (
                  selectedItems.map((item, index) => (
                    <div key={index} className="flex items-center h-10 border px-3 py-1 rounded-md bg-gray-50">
                      <span>{item}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 p-2">No checklist items selected</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button 
              onClick={onClose} 
              type="button" 
              className="bg-primary hover:bg-primary/90 text-white px-5"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <form onSubmit={handleSubmit} className="font-poppins space-y-5">
        <div className="flex grow gap-8">
          <div className="flex flex-col grow gap-2">
            {/* TEMPLATE IDENTITY */}
            <label htmlFor="templateName" className="font-medium">Template Name</label>
            <Input 
              id="templateName"
              placeholder="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              required
            />
            
            {/* CHECK LIST */}
            <h1 className="my-1 font-medium">Check List Items</h1>
            <div>
              <CheckList 
                selectedItems={selectedItems} 
                setSelectedItems={setSelectedItems} 
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            onClick={onClose} 
            type="button" 
            variant="outline"
            className="px-5"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-white px-5"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              mode === 'create' ? 'Create Template' : 'Update Template'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}