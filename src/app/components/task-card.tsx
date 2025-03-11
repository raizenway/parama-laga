"use client";

export default function TaskCard() {
    return (
        <button className="bg-white border-2 border-zinc-200 rounded-lg shadow-md p-5 flex flex-col hover:bg-gray-100 transition duration-300">
            <div className="flex items-center gap-4">
                <div className="text-left">
                    <div className="font-poppins font-bold text-primary mb-2">Task</div>
                    <div className="flex gap-1 text-sm text-gray-600">Deskripsi singkat task</div>
                </div>
            </div>
        </button>
    );
}
