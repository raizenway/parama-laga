import {
  CreditCard,
  TrafficCone,
  CalendarCheck2,
  CalendarClock,
  Clock
} from "lucide-react";

export default function Page() {
  return (
    <div className="mx-8 h-screen flex-wrap space-y-5 ">
      {/* Baris 1 */}
      <div className="mt-10 flex gap-10 h-1/3 ">
        <div className="grow flex flex-col w-full h-full ">
          <div className="flex-1/5 font-poppins font-bold underline my-2">Profile User</div>
          <div className="flex-1 flex flex-wrap grow bg-gradient-primary rounded-2xl justify-start items-center">
              <img src="/person.png" className="ml-5 min-w-[125px] w-1/5 aspect-square rounded-full object-cover" alt="Profile Picture"/>
              <div className="ml-5 space-y-3">
                <div className="font-poppins font-bold text-primary">Jono Murjono</div>
                  <div className="flex">
                  <div className="font-poppins font-bold text-primary">JO1987234</div>
                  <div className="font-poppins font-bold text-primary">/Operasional</div>
                </div>
                <div className="font-poppins font-bold text-primary">Project KAI</div>
              </div>              
          </div>
        </div>

        <div className="grow flex flex-col w-full h-full ">
          <div className="flex-1/5 font-poppins font-bold underline my-2">Notification</div>
            <div className="p-5 flex flex-1 flex-wrap grow bg-tersier rounded-2xl justify-start items-start">
            <div className="space-y-1">
                <div className="font-poppins text-primary">1. Segera lakukan pemeriksaan kurva S</div>
                <div className="flex flex-wrap gap-1">
                  <div className="font-poppins text-primary">2. Waktu pengisian checklist aktivitas</div>
                  <div className="font-poppins text-danger font-bold">(Due: Friday 7 February 2025)</div>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Baris 2 */}
      <div className="grow">
        <div className="font-poppins font-bold underline my-3">Table Project</div>
        <div className="grow h-96 bg-white rounded-2xl flex justify-center items-start p-4 shadow-[0px_0px_13px_2px_rgba(0,_0,_0,_0.2)]">
          <div className="overflow-auto max-h-full w-full ">
            <table className="font-poppins w-full table-auto justify-start">
            <thead className="bg-tersier">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg text-left">
                  <div className="flex items-center gap-1"><CreditCard /> Employees ID</div>
                </th>
                <th className="px-4 py-2 text-left">
                  <div className="flex items-center gap-1"><TrafficCone /> Projects</div>
                </th>
                <th className="px-4 py-2 text-left">
                  <div className="flex items-center gap-1"><CalendarCheck2 /> Created Date</div>
                </th>
                <th className="px-4 py-2 text-left">
                  <div className="flex items-center gap-1"><CalendarClock /> Due Date</div>
                </th>
                <th className="px-4 py-2 rounded-tr-lg text-left">
                  <div className="flex items-center gap-1"><Clock /> Status</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr key={i} className="border-b-2 border-tersier">
                  <td className="px-4 py-3">Michigan</td>
                  <td className="px-4 py-3">Project C</td>
                  <td className="px-4 py-3">10-01-2024</td>
                  <td className="px-4 py-3">10-02-2024</td>
                  <td className="px-4 py-3">Pending</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
    
  )
}