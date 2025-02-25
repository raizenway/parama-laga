
import CheckListForm from "../form/check-list-form";
import Modal from "./modal";

export default function CheckListModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Check List Detail">
      <CheckListForm onClose={onClose} />
    </Modal>
  );
}
