"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash, Check } from "lucide-react";

export default function CheckListForm({ onClose }: { onClose: () => void }) {
  const [checkList, setCheckList] = useState<string[]>([
    "Cek Kop Surat",
    "Cek Tanda Tangan",
    "Cek Stempel",
    "Cek Isi Surat",
    "Cek Format",
  ]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addNewCriteria = () => {
    setCheckList([...checkList, ""]);
  };

  const removeCriteria = (index: number) => {
    setCheckList((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCriteria = (index: number, value: string) => {
    setCheckList((prev) =>
      prev.map((item, i) => (i === index ? value : item))
    );
  };

  const confirmEdit = () => {
    setEditingIndex(null);
  };

  return (
    <div className="w-full bg-white p-5 rounded-lg shadow-md space-y-3">
      <Input type="search" placeholder="Search check criteria" />
      <form className="font-poppins space-y-4">
        {/* Container dengan batas tinggi dan overflow */}
        <div className="max-h-80 overflow-y-auto border border-gray-300 p-2 rounded-lg">
          {checkList.map((item, index) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <Input
                type="text"
                value={item}
                placeholder="Write Check Criteria"
                onChange={(e) => updateCriteria(index, e.target.value)}
                onFocus={() => setEditingIndex(index)}
                className="flex-grow"
              />
              
              {/* Tombol checklist hanya muncul saat pengguna sedang mengedit */}
              {editingIndex === index && (
                <button
                  type="button"
                  onClick={confirmEdit}
                  className="p-1 rounded-md bg-green-500 text-white hover:bg-green-700"
                >
                  <Check size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={() => removeCriteria(index)}
                className="p-1 rounded-md bg-red-500 text-white hover:bg-red-700"
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          onClick={addNewCriteria}
          className="mt-2 bg-blue-600 text-white hover:bg-blue-800 w-full"
        >
          + Add New Check Criteria
        </Button>

        <Button type="submit" className="mt-2 bg-primary text-white hover:bg-indigo-900 w-full">
          Save
        </Button>
      </form>
    </div>
  );
}
