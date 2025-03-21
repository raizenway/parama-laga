import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, X } from "lucide-react";

export default function DropdownMultipleSelection({
  options,
  selectedItems,
  setSelectedItems,
}: {
  options: string[];
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
}) {
  const toggleSelection = (value: string) => {
    setSelectedItems(
      selectedItems.includes(value)
        ? selectedItems.filter((item) => item !== value)
        : [...selectedItems, value]
    );
  };

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full border-slate-500 justify-between">
              <span className={selectedItems.length > 0 ? "" : "text-opacity-40 text-black"}>
                {selectedItems.length > 0 ? selectedItems.join(", ") : "Click to Select"}
              </span>
            <ChevronDown className="text-slate-500 ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-popper-anchor-width)]">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={selectedItems.includes(option)}
              onCheckedChange={() => toggleSelection(option)}
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedItems.length > 0 && (
        <div className="border border-gray-300 rounded-md p-3 space-y-1">
          {selectedItems.map((item) => (
            <div key={item} className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded-md">
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
