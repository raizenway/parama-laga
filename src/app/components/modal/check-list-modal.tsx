
import CheckListForm from "../form/check-list-form";
import Modal from "./modal";

export default function CheckListModal({ open, onClose }: { open: boolean; onClose: () => void }) {

  const handleClose = () => {
    onClose();
    window.location.reload(); 
  };

  return (
    <Modal open={open} closeType="cross" onClose={handleClose} title="Check List Detail">
      <CheckListForm onClose={handleClose} />
    </Modal>
  );
}
