"use client";

import { Users } from "lucide-react";
import { CalendarClock } from "lucide-react";

export default function ProjectCard() {
    return (
        <button className="bg-white border-2 border-zinc-200 rounded-lg shadow-md p-5 flex flex-col hover:bg-gray-100 transition duration-300">
            <div className="flex items-center gap-4">
                <div className="text-left">
                    <div className=" font-bold text-primary mb-2">Project A</div>
                    <div className="flex gap-1 text-sm text-gray-600"><Users size={16} className="text-blue-900"/>12 Pegawai</div>
                    <div className="flex gap-1 text-sm text-gray-600"><CalendarClock size={16} className="text-red-400"/>15 November 2025</div>
                </div>
            </div>
        </button>
    );
}
