import { CalendarCheck2, CreditCard, FileText, Eye, IterationCw, MoveDown, PencilLine, TrafficCone, Trash2, Zap, ListCheck, CircleArrowRight } from "lucide-react"
import React from "react"

export default function TaskTable(){
    return(
        <table className="font-poppins w-full table-auto justify-start">
        <thead className="bg-tersier">
          <tr>
            <th className="px-4 py-2 text-left rounded-tl-lg">
              <div className="flex items-center gap-1"><ListCheck /> Task Name</div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><FileText /> Document Type </div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><TrafficCone /> Project </div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><CalendarCheck2 /> Date Added </div>
            </th>
            <th className="flex px-4 py-2 text-center justify-center ">
              <div className="flex text-center gap-1"><IterationCw /> Iteration </div>
            </th>
            <th className="px-4 py-2 rounded-tr-lg text-center justify-center">
              <div className="flex items-center gap-1"><Zap /> Act </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-b-2 border-tersier">
                <td className="px-4 py-3">Document Checking</td>
                <td className="px-4 py-3">Meeting Document</td>
                <td className="px-4 py-3">Project KAI</td>
                <td className="px-4 py-3">1 Jan 2025</td>
                <td className="px-4 py-3 text-center w-1/12 ">3</td>
                <td className="px-4 py-3 flex gap-5">
                    <button>
                      <PencilLine className="text-green-600 hover:text-green-700"/>
                    </button>
                    <button>
                      <Trash2 className="text-red-500 hover:text-red-700"/>
                    </button>
                    <button>
                      <CircleArrowRight size={30} className="text-blue-500 hover:text-blue-700"/>
                    </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
    )
}