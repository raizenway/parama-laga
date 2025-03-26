
import DocumentTypeForm from "../form/document-type-form";
import Modal from "./modal";

export default function CheckListModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} closeType="cross" onClose={onClose} title="Document Type Detail">
      <DocumentTypeForm onClose={onClose} />
    </Modal>
  );
}
