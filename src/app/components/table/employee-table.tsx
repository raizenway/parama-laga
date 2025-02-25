import React from "react";

import { User, MoveDown, Users, CreditCard, CalendarCheck2, TrafficCone, Zap, PencilLine, Trash2, Eye } from "lucide-react";

export default function EmployeeTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse font-poppins">
        {/* HEADER */}
        <thead className="bg-tersier text-left">
          <tr className="text-black">
            {[
              { icon: <User />, label: "Profile" },
              { icon: <MoveDown />, label: "Name" },
              { icon: <Users />, label: "Position" },
              { icon: <CreditCard />, label: "Employee ID" },
              { icon: <CalendarCheck2 />, label: "Date Added" },
              { icon: <TrafficCone />, label: "Projects" },
              { icon: <Zap />, label: "Act" },
            ].map(({ icon, label }, i) => (
              <th key={i} className={`px-4 py-2 ${i === 0 ? "rounded-tl-lg" : ""} ${i === 6 ? "rounded-tr-lg" : ""}`}>
                <div className="flex items-center gap-1">{icon} {label}</div>
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-b border-tersier">
              <td className="px-4 py-3">
                <div className="h-10 w-10 bg-green-300 rounded-full mx-auto"></div>
              </td>
              <td className="px-4 py-3">John Doe</td>
              <td className="px-4 py-3">Operator</td>
              <td className="px-4 py-3">DT 1452780</td>
              <td className="px-4 py-3">1 Jan 2025</td>
              <td className="px-4 py-3">KAI</td>
              <td className="px-4 py-3 flex justify-center gap-3">
                {[{ icon: <PencilLine />, color: "text-green-600 hover:text-green-700" },
                  { icon: <Trash2 />, color: "text-red-500 hover:text-red-700" },
                  { icon: <Eye />, color: "text-slate-800 hover:text-slate-950" }
                ].map(({ icon, color }, j) => (
                  <button key={j} className={color}>{icon}</button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
