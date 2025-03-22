
import TemplateForm from "../form/template-form";
import Modal from "./modal";

export default function TemplateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal closeType="cross" open={open} onClose={onClose} title="Template Detail">
      <TemplateForm onClose={onClose} />
    </Modal>
  );
}
