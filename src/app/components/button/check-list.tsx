"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

type Checklist = {
  id: number;
  criteria: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function CheckList({
  selectedItems,
  setSelectedItems
}: {
  selectedItems: string[];
  setSelectedItems: (items: string[] | ((prev: string[]) => string[])) => void;
}) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch checklists from the database
  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/checklists');

        if (!response.ok) {
          throw new Error("Failed to fetch checklists");
        }

        const data: Checklist[] = await response.json();
        setChecklists(data);
      } catch (error) {
        console.error("Error fetching checklists:", error);
        toast.error("Failed to load checklists");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklists();
  }, []);

  const toggleSelection = (criteria: string) => {
    setSelectedItems((prev) =>
      prev.includes(criteria) ? prev.filter((item) => item !== criteria) : [...prev, criteria]
    );
  };

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between h-12" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading checklists...
              </span>
            ) : (
              selectedItems.length > 0 ? `${selectedItems.length} Check Added` : "Add Check"
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-80 overflow-y-auto border border-gray-300 p-2 rounded-lg w-[var(--radix-popper-anchor-width)]">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </div>
          ) : checklists.length > 0 ? (
            checklists.map((checklist) => (
              <DropdownMenuCheckboxItem
                key={checklist.id}
                checked={selectedItems.includes(checklist.criteria)}
                onCheckedChange={() => toggleSelection(checklist.criteria)}
              >
                {checklist.criteria}
              </DropdownMenuCheckboxItem>
            ))
          ) : (
            <div className="p-2 text-center text-gray-500">No checklists available</div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedItems.length > 0 && (
        <div className="max-h-80 overflow-y-auto border border-gray-300 p-2 rounded-lg space-y-1">
          {selectedItems.map((item) => (
            <div key={item} className="flex items-center h-12 justify-between border border-blue-500 text-blue-500 bg-gray-100 px-3 py-1 rounded-md">
              <span>{item}</span>
              <button
                onClick={() => setSelectedItems(selectedItems.filter((i) => i !== item))}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}