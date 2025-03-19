import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

// Define the status type to match what's expected in the employee form
type UserStatus = "active" | "inactive";

export default function StatusDropdown({ status, setStatus }: { 
  status: UserStatus, 
  setStatus: (value: UserStatus) => void 
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button
                className={cn(
                  "justify-between items-center",
                  status === "active" ? "text-emerald-500 hover:text-emerald-600 border-green-300" : 
                  status === "inactive" ? "text-red-500 hover:text-red-500 border-red-300" : 
                  "text-black"
                )}
                variant="outline"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}  
                <ChevronDown />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-popper-anchor-width)]">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
                <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="inactive">Inactive</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}