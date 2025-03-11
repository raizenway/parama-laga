import { CalendarCheck2, CreditCard, Eye, MoveDown, PencilLine, Trash2, Zap } from "lucide-react"
import React from "react"

export default function TemplateTable(){
    return(
        <table className="font-poppins w-full table-auto justify-start">
        <thead className="bg-tersier">
          <tr>
            <th className="px-4 py-2 text-left rounded-tl-lg">
              <div className="flex items-center gap-1"><MoveDown /> Template Name</div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1"><CalendarCheck2 /> Date Added </div>
            </th>
            <th className="px-4 py-2 rounded-tr-lg text-left">
              <div className="flex items-center gap-1"><Zap /> Act </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-b-2 border-tersier">
              <td className="px-4 py-3">Cek Proposal</td>
              <td className="px-4 py-3">1 Jan 2025</td>
              <td className="px-4 py-3 flex gap-5 ">
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