import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface DropdownSingleSelectionProps<T> {
  options: T[];
  selectedItem: T | null;
  setSelectedItem: (item: T | null) => void;
  isDisabled?: boolean;
  getKey?: (item: T) => string | number;
  renderItem?: (item: T) => React.ReactNode;
}

export default function DropdownSingleSelection<T>({
  options,
  selectedItem,
  setSelectedItem,
  isDisabled = false,
  getKey = (item) => String(item),
  renderItem = (item) => String(item)
}: DropdownSingleSelectionProps<T>) {
  const handleSelect = (value: T) => {
    setSelectedItem(selectedItem === value ? null : value);
  };

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between" disabled={isDisabled}>
            <span
              className={`${
                selectedItem ? "" : "text-opacity-40 text-black"
              } overflow-hidden text-ellipsis whitespace-nowrap`}
            >
              {selectedItem ? renderItem(selectedItem) : "Click to Select"}
            </span>
            <ChevronDown className="text-slate-500 ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-popper-anchor-width)] max-h-96 overflow-y-auto">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={getKey(option)}
              checked={selectedItem === option}
              onCheckedChange={() => handleSelect(option)}
            >
              {renderItem(option)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
