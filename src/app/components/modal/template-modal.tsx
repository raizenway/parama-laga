import { Input } from "@/components/ui/input";
import TemplateForm from "../form/template-form";
import Modal from "./modal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Template = {
  id: number;
  templateName: string;
  templateChecklists: {
    id: number;
    templateId: number;
    checklistId: number;
    checklist: {
      id: number;
      criteria: string;
    }
  }[];
};

type TemplateModalProps = {
  open: boolean;
  onClose: () => void;
  template?: Template | null;
  mode?: 'create' | 'edit' | 'view';
  onTemplateChange?: () => void;
};

export default function TemplateModal({ 
  open, 
  onClose, 
  template = null,
  mode = 'create',
  onTemplateChange = () => {}
}: TemplateModalProps) {
  const [newCriteria, setNewCriteria] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <Modal 
      closeType="cross" 
      open={open} 
      onClose={onClose} 
      title={`${mode === 'create' ? 'Add New' : mode === 'edit' ? 'Edit' : 'View'} Template`}
    >
      <TemplateForm 
        onClose={onClose} 
        template={template} 
        mode={mode}
        onSuccess={onTemplateChange}
      />
      
    </Modal>
  );
}