import TemplateForm from "../form/template-form";
import Modal from "./modal";

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