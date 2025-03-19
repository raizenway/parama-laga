"use client";

import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  // Calculate width based on size prop
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <Dialog open={open} modal>
      <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" />
      <DialogContent className={`bg-white p-6 rounded-lg shadow-lg ${sizeClasses[size]} w-full mx-4 z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-4">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <X className="text-red-500 hover:text-red-700 cursor-pointer" onClick={onClose} />
        </div>
        {/* Konten */}
        {children}
      </DialogContent>
    </Dialog>
  );
}