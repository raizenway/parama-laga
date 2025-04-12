import { Button } from "@/components/ui/button";
import Modal from "./modal";
import { Trash2 } from "lucide-react";

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
  title = "Delete Confirmation", 
  description,
  entityType = "karyawan",
  isLoading = false 
}: DeleteConfirmationProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="w-1/3">
      <div className=" text-center">
        <div className="justify-items-center">
          <Trash2 className="text-red-500" size={75}/>
        </div>
        <p className="m-4 text-lg">
          Are you sure you want to delete <span className="font-semibold">{name}</span>?
        </p>
        <p className="text-gray-600 mb-10">
          {description || `This action cannot be undone and ${entityType} will be deleted.`}
        </p>
        <div className="flex justify-center space-x-4">
          <Button onClick={onClose} variant="outline" disabled={isLoading} className="w-1/3">
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            variant="destructive" 
            disabled={isLoading}
            className="w-1/3"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}