import { Button } from "@/components/ui/button";
import Modal from "./modal";

type DeleteConfirmationProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
  title?: string;
  description?: string;
  entityType?: string;
  isLoading?: boolean;
};

export default function DeleteConfirmation({ 
  open, 
  onClose, 
  onConfirm, 
  name, 
  title = "Konfirmasi Hapus", 
  description,
  entityType = "karyawan",
  isLoading = false 
}: DeleteConfirmationProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="p-4 text-center">
        <p className="mb-4 text-lg">
          Apakah Anda yakin ingin menghapus {entityType} <span className="font-semibold">{name}</span>?
        </p>
        <p className="text-gray-600 mb-6">
          {description || `Tindakan ini tidak dapat dibatalkan dan semua data terkait ${entityType} ini akan dihapus.`}
        </p>
        <div className="flex justify-center space-x-4">
          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            Batal
          </Button>
          <Button 
            onClick={onConfirm} 
            variant="destructive" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Menghapus...
              </span>
            ) : (
              "Hapus"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}