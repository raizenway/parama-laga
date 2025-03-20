import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export default function DropdownSingleSelection({
  options,
  selectedItem,
  setSelectedItem,
}: {
  options: string[];
  selectedItem: string | null;
  setSelectedItem: (item: string | null) => void;
}) {
  const handleSelect = (value: string) => {
    setSelectedItem(selectedItem === value ? null : value);
  };

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full border-slate-500 justify-between">
              <span className={selectedItem ? "" : "text-opacity-40 text-black"}>
                {selectedItem ? `${selectedItem}` : "Click to Select"}
              </span>
            <ChevronDown className="text-slate-500 ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-popper-anchor-width)]">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={selectedItem === option}
              onCheckedChange={() => handleSelect(option)}
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
