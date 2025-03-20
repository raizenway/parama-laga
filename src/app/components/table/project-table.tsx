import { Building2, CalendarCheck2, CalendarClock, CreditCard, Eye, MoveDown, PencilLine, TrafficCone, Trash2, Zap } from "lucide-react"
import React from "react"

export default function ProjectTable(){
    return (
        <table className="font-poppins w-full table-auto justify-start">
        <thead className="bg-tersier">
          <tr>
            <th className="px-4 py-2 rounded-tl-lg text-left">
              <div className="flex items-center gap-1">Logo</div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><TrafficCone /> Project</div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><Building2 /> Company </div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><CreditCard /> ID Project </div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><CalendarCheck2 /> Date Added </div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><CalendarClock /> Due Date </div>
            </th>
            <th className="px-4 py-2 rounded-tr-lg text-left">
              <div className="flex items-center gap-1"><Zap /> Act </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-b-2 border-tersier">
              <td className="px-4 py-3 justify-items-center"><div className="justify-center h-10 w-10 bg-green-300 rounded-full "></div></td>
              <td className="px-4 py-3">Project KAI</td>
              <td className="px-4 py-3">KAI</td>
              <td className="px-4 py-3">DT 1452780</td>
              <td className="px-4 py-3">1 Jan 2025</td>
              <td className="px-4 py-3">1 Dec 2025</td>
              <td className="px-4 py-3 flex justify-center gap-5 ">
                <button>
                  <PencilLine className="text-green-600 hover:text-green-700"/>
                </button>
                <button>
                  <Trash2 className="text-red-500 hover:text-red-700"/>
                </button>
                <button>
                  <Eye className="text-slate-800 hover:text-slate-950"/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
    )
}