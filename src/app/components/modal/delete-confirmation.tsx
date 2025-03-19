import { Button } from "@/components/ui/button";
import Modal from "./modal";

type DeleteConfirmationProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
  isLoading?: boolean;
};

export default function DeleteConfirmation({ open, onClose, onConfirm, name, isLoading = false }: DeleteConfirmationProps) {
  return (
    <Modal open={open} onClose={onClose} title="Konfirmasi Hapus">
      <div className="p-4 text-center">
        <p className="mb-4 text-lg">
          Apakah Anda yakin ingin menghapus karyawan <span className="font-semibold">{name}</span>?
        </p>
        <p className="text-gray-600 mb-6">
          Tindakan ini tidak dapat dibatalkan dan semua data terkait karyawan ini akan dihapus.
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