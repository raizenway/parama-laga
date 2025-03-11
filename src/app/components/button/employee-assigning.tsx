import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { X } from "lucide-react";

const employees = ["Jono", "Joko", "Juned", "Josef", "Jajang", "Jujun", "Junaedi", "Jaka", "Jokowi", "Jefri"];

export default function EmployeeAssigning({selectedItems, setSelectedItems} : {selectedItems:string[],  setSelectedItems: (items: string[] | ((prev: string[]) => string[])) => void}){
    const toggleSelection = (value: string) => {
        setSelectedItems((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
        );
    };

    return (
        <div className="space-y-2">
            <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                        {selectedItems.length > 0 ? `${selectedItems.length} Assigned` : "Assign Employee"}
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[var(--radix-popper-anchor-width)]">
                    {employees.map((option) => (
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
    )
}


