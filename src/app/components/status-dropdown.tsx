import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

// Generic type that can be used for both employee and project statuses
type StatusDropdownProps<T extends string> = {
  status: T;
  setStatus: (value: T) => void;
  options: Array<{
    value: T;
    label: string;
    color?: string;
  }>;
  label?: string;
};

export default function StatusDropdown<T extends string>({ 
  status, 
  setStatus,
  options,
  label = "Status"
}: StatusDropdownProps<T>) {
    // Get the current option data for styling
    const currentOption = options.find(opt => opt.value === status);
    
    // Default color styling based on common status names
    const getDefaultColor = (status: string) => {
      const lowercaseStatus = status.toLowerCase();
      if (lowercaseStatus.includes('active') || lowercaseStatus.includes('completed')) return "text-emerald-500 hover:text-emerald-600 border-green-300";
      if (lowercaseStatus.includes('inactive') || lowercaseStatus.includes('delayed')) return "text-red-500 hover:text-red-600 border-red-300";
      if (lowercaseStatus.includes('ongoing')) return "text-blue-500 hover:text-blue-600 border-blue-300";
      if (lowercaseStatus.includes('pending')) return "text-yellow-500 hover:text-yellow-600 border-yellow-300";
      return "text-gray-700 hover:text-gray-800 border-gray-300";
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button
                className={cn(
                  "justify-between items-center",
                  currentOption?.color || getDefaultColor(status)
                )}
                variant="outline"
              >
                {/* Display the label if available, otherwise capitalize the status */}
                {currentOption?.label || status.charAt(0).toUpperCase() + status.slice(1)}
                <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-popper-anchor-width)]">
              <DropdownMenuLabel>{label}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
                {options.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}