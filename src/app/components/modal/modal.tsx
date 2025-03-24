"use client";

import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import Button from "../button/button";
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  closeType: "cross" | "button";
  closeText?: string;
  width?: string;
  height?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({ open, onClose, title, closeType, closeText="Okay", width="w-1/2", height="", children }: ModalProps) {
  return (
    <Dialog open={open} modal>
      <DialogOverlay className="fixed inset-0 flex bg-opacity items-center justify-center" />
      <DialogContent className={`bg-white rounded-lg shadow-lg ${width} ${height} max-w-full min-w-[300px]`}>
        <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            {closeType === "cross" && (
              <X className="text-red-500 hover:text-red-700 cursor-pointer" onClick={onClose} />
            )}
        </div>

          {children}
        <div className="mt-3 flex justify-center">
          {closeType === "button" && (
              <Button text={`${closeText}`} color="bg-sky-500" hoverColor="hover:bg-sky-600" textColor="text-white" onClick={onClose} />
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}