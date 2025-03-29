"use client"
import { Input } from "@/components/ui/input"
import TemplateModal from "@/app/components/modal/template-modal";
import Button from "@/app/components/button/button-custom";
import { useState } from "react";
import TemplateTable from "@/app/components/table/template-table";
import CheckListModal from "@/app/components/modal/check-list-modal";
import { FileCheck2, FileText, PencilLine } from "lucide-react";
import DeleteConfirmation from "@/app/components/modal/delete-confirmation";
import { toast } from "sonner";
import DocumentTypeModal from "@/app/components/modal/document-type-modal"

// Define Template type
type Template = {
  id: number;
  templateName: string;
  createdAt: string;
  updatedAt: string;
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

export default function Page() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCheckListDetailOpen, setIsCheckListDetailOpen] = useState(false);
  const [isDocumentTypeOpen, setIsDocumentTypeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  
  // Handle add template
  const handleAddTemplate = () => {
    setSelectedTemplate(null);
    setModalMode('create');
    setIsDetailOpen(true);
  };
  
  // Handle edit template
  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setModalMode('edit');
    setIsDetailOpen(true);
  };
  
  // Handle view template
  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setModalMode('view');
    setIsDetailOpen(true);
  };
  
  // Handle delete template
  const handleDeleteTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsDeleteOpen(true);
  };
  
  // Handle confirm delete template
  const handleConfirmDelete = async () => {
    if (!selectedTemplate) return;
    
    setIsDeleteLoading(true);
    try {
      const response = await fetch(`/api/templates/${selectedTemplate.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Template deleted successfully');
        setIsDeleteOpen(false);
        // Refresh the template table
        window.location.reload();
      } else {
        const data = await response.json();
        toast.error('Failed to delete template', {
          description: data.message || 'An error occurred'
        });
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('An error occurred while deleting the template');
    } finally {
      setIsDeleteLoading(false);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="mx-8 h-screen flex-wrap space-y-5">
      {/* Header & Controls */}
      <div className="mt-12 grow">
        <div className="font-poppins font-bold text-2xl">Templates</div>
        <div className="flex justify-end items-center gap-3">
          <Input 
            className="w-72" 
            type="search" 
            placeholder="Search templates..." 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Button 
            text="+ Add Template" 
            onClick={handleAddTemplate}
          />
          <Button 
            text="Edit Check Lists" 
            onClick={() => setIsCheckListDetailOpen(true)} 
            icon={PencilLine} 
            iconPosition="left"
          />
          <Button 
            text="Document Types" 
            onClick={() => setIsDocumentTypeOpen(true)} 
            icon={FileText} 
            iconPosition="left"
          />
        </div>
        
        {/* Template Table */}
        <div className="grow h-96 bg-white rounded-2xl flex justify-center items-start p-4">
          <div className="max-h-full w-full">
            <TemplateTable 
              onEdit={handleEditTemplate} 
              onDelete={handleDeleteTemplate}
              onView={handleViewTemplate}
              searchTerm={searchTerm}
            />
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <TemplateModal 
        open={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        template={selectedTemplate}
        mode={modalMode}
        onTemplateChange={() => window.location.reload()}
      />
      
      <CheckListModal 
        open={isCheckListDetailOpen} 
        onClose={() => setIsCheckListDetailOpen(false)} 
      />

      <DocumentTypeModal 
        open={isDocumentTypeOpen}
        onClose={() => setIsDocumentTypeOpen(false)}
      />
      
      <DeleteConfirmation
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        name={selectedTemplate?.templateName || ""}
        entityType="template"
        title="Confirm Template Deletion"
        description="This action cannot be undone. All checklist associations will also be removed."
        isLoading={isDeleteLoading}
      />
    </div>
  );
}