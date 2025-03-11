"use client"
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CheckList from "../button/check-list";

export default function TemplateForm({onClose} : {onClose: () => void}) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const removeItem = (value: string) => {
    setSelectedItems((prev) => prev.filter((item) => item !== value));
  };
  
  return (
    <div className="w-full bg-white">
      <form className="font-poppins space-y-5">
        
        <div className="flex grow gap-8">
      
          <div className="flex flex-col grow gap-2">
            {/* TEMPLATE IDENTITY */}
              <Input placeholder="Template Name"/>
            
            {/*CHECK LIST */}
            <h1 className="my-1">Check List</h1>
            <CheckList selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
            <Button className="my-2 bg-primary text-white w-1/3 hover:bg-indigo-900"> Submit </Button>

          </div>

        </div> 
      </form>
    </div>
  )
  
}
