
import { CheckCircle2 } from "lucide-react";
import Modal from "./modal";

export default function TemplateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} closeType="button" width="w-1/5" height="1/5" onClose={onClose} title="">
        <div className="flex flex-col justify-center items-center gap-5">
            <CheckCircle2 size={100} className="text-emerald-500"/>
            <div className=" font-bold text-2xl">Progress saved</div>
        </div>
    </Modal>
  );
}
