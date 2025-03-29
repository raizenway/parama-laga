import { Button } from "@/components/ui/button";
import Modal from "./modal";
import { Loader2 } from "lucide-react";

type TaskUpdateConfirmationProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: React.ReactNode; // Change type to ReactNode to accept JSX
  isLoading?: boolean;
};

export default function TaskUpdateConfirmation({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Konfirmasi Update Task", 
  description = "Apakah Anda yakin ingin menyimpan perubahan pada task ini?",
  isLoading = false 
}: TaskUpdateConfirmationProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="p-4 text-center">
        {/* Remove the wrapping <p> tag since description may contain p tags */}
        <div className="mb-4">
          {description}
        </div>
        <div className="flex justify-center space-x-4 mt-6">
          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            Batal
          </Button>
          <Button 
            onClick={onConfirm} 
            variant="default"
            disabled={isLoading}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Menyimpan...
              </span>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}