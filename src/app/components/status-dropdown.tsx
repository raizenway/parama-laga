import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";


export default function StatusDropdown({ position, setPosition }: { position: string, setPosition: (value: string) => void }){
    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button
                className={cn(
                  "justify-between items-center",
                  position === "Active" ? "text-emerald-500 hover:text-emerald-600 border-green-300" : position === "Non-active" ? "text-red-500 hover:text-red-500 border-red-300" : "text-black"
                )}
                variant="outline"
              >
                {position === "Status"  ? "Status" : position.charAt(0).toUpperCase() + position.slice(1)}  
                <ChevronDown />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-popper-anchor-width)]">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                <DropdownMenuRadioItem value="Active">Active</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Non-active">Non-active</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}