"use client";

import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <Dialog open={open} modal>
      <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" />
      <DialogContent className="bg-white p-10 rounded-lg shadow-lg w-1/2 max-w-full">
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
