"use client"
import { CalendarCheck2, CreditCard, FileText, Eye, IterationCw, MoveDown, PencilLine, TrafficCone, Trash2, Zap, ListCheck, CircleArrowRight, Clock, Hourglass } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react";

export default function TaskTable(){
  const router = useRouter();

  return(
        <table className="font-poppins w-full table-auto justify-start">
        <thead className="bg-tersier">
        <tr>
            <th className="px-4 py-2 w-[25%] text-left  rounded-tl-lg">
              <div className="flex items-center gap-1">
                <ListCheck /> Task Name
              </div>
            </th>
            <th className="px-4 py-2 w-[20%] text-left ">
              <div className="flex items-center gap-1">
                <FileText /> Document Type
              </div>
            </th>
            <th className="px-4 py-2 w-[10%] text-left ">
              <div className="flex items-center gap-1">
                <TrafficCone /> Project
              </div>
            </th>
            <th className="px-4 py-2 w-[15%] text-left ">
              <div className="flex items-center gap-1">
                <CalendarCheck2 /> Date Added
              </div>
            </th>
            <th className="px-4 py-2 w-[10%] text-center ">
              <div className="flex items-center justify-center gap-1">
                <IterationCw /> Iteration
              </div>
            </th>
            <th className="px-4 py-2 w-[10%] text-left ">
              <div className="flex items-center gap-1">
                <Hourglass /> Status
              </div>
            </th>
            <th className="px-4 py-2 w-[10%] text-center  rounded-tr-lg">
              <div className="flex items-center justify-center gap-1">
                <Zap /> Act
              </div>
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
                <td className="px-4 py-3 text-center w-1/12 ">On Going</td>
                <td className="px-4 py-3 flex gap-5">
                    <button>
                      <PencilLine className="text-green-600 hover:text-green-700"/>
                    </button>
                    <button>
                      <Trash2 className="text-red-500 hover:text-red-700"/>
                    </button>
                    <button onClick={() => router.push("/task/detail-task")}>
                      <CircleArrowRight size={30} className="text-blue-500 hover:text-blue-700"/>
                    </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
    )
}