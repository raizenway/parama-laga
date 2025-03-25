import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DropdownMultipleSelection({
  options,
  selectedItems,
  setSelectedItems,
  mode,
  disabled,
}: {
  options: string[];
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  mode?: string;
  disabled?: boolean;
}) {
  const toggleSelection = (value: string) => {
    setSelectedItems(
      selectedItems.includes(value)
        ? selectedItems.filter((item) => item !== value)
        : [...selectedItems, value]
    );
  };
  const isViewMode = mode === "view" || disabled;

  return (
    <div className={cn("space-y-2", isViewMode ? "bg-gray-50 rounded-md" : "")}>
      {/* The dropdown button - hidden in view mode if items are selected */}
      {(!isViewMode || selectedItems.length === 0) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isViewMode}>
            <Button 
              variant="outline" 
              className={cn(
                "w-full justify-between", 
                isViewMode ? "bg-gray-50 text-gray-500 border-gray-200" : "border-slate-500"
              )} 
              disabled={isViewMode}
            >
              <span className={`truncate ${selectedItems.length > 0 ? "" : "text-opacity-40 text-black"}`}>
                {selectedItems.length > 0 
                  ? (selectedItems.length > 2 
                      ? `${selectedItems.slice(0, 2).join(", ")} + ${selectedItems.length - 2} more` 
                      : selectedItems.join(", "))
                  : "No Projects Selected"}
              </span>
              <ChevronDown className="text-slate-500 ml-2 h-4 w-4 shrink-0" />
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
      )}

      {/* Show a different, clearer header in view mode when projects are selected */}
      {isViewMode && selectedItems.length > 0 && (
        <div className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-t-md bg-gray-50">
          Assigned Projects ({selectedItems.length})
        </div>
      )}

      {/* Display selected items */}
      {selectedItems.length > 0 && (
        <div className={cn(
          "border rounded-md p-3 space-y-1", 
          isViewMode ? "bg-gray-50 border-gray-200" : "border-gray-300",
          // Adjust top border radius if we have the header in view mode
          isViewMode ? "rounded-t-none border-t-0" : ""
        )}>
          {selectedItems.map((item) => (
            <div key={item} className={cn(
              "flex items-center justify-between px-3 py-1.5 rounded-md",
              isViewMode 
                ? "bg-blue-50 text-blue-700 border border-blue-100" 
                : "bg-gray-100" 
            )}>
              <span className={isViewMode ? "font-medium" : ""}>
                {item}
              </span>
              {!isViewMode && (
                <button
                  onClick={() => setSelectedItems(selectedItems.filter((i) => i !== item))}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* No projects message in view mode */}
      {isViewMode && selectedItems.length === 0 && (
        <div className="px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-md bg-gray-50">
          No projects assigned
        </div>
      )}
    </div>
  );
}