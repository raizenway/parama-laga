"use client";

import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TaskCard() {
    const router = useRouter();

    const handleClick = () => {
        router.push("/task/detail-task");
      };

    return (
        <button 
            onClick={handleClick}
            className="bg-white border-2 border-zinc-200 rounded-lg shadow-md p-5 flex flex-col hover:bg-gray-100 transition duration-300"
        >
            <div className="flex items-center gap-4">
                <ClipboardList size={36}/>
                <div className="text-left">
                    <div className="font-poppins font-bold text-primary mb-2">Template Task</div>
                    <div className="flex gap-1 text-sm text-gray-600">Template description</div>
                </div>  
            </div>
        </button>
    );
}
