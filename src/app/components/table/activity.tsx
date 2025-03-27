import { useState } from "react";
import { Check, CircleCheckBig, ListChecks, NotebookPen, PlusCircle } from "lucide-react";
import Button from "../button/button-custom";
import Notification from "@/app/components/modal/notification-modal"

const initialRows = [
  { task: "Update kurva S", checked: false },
  { task: "Meeting mingguan", checked: false },
  { task: "Sprint mingguan", checked: false },
  { task: "Controlling mingguan", checked: false },
  { task: "Monitoring mingguan", checked: false },
];

export default function ChecklistTable() {
  const [rows, setRows] = useState(initialRows);
  const [showNotif, setShowNotif] = useState(false);

  const toggleCheck = (index: number) => {
    const updatedRows = [...rows];
    updatedRows[index].checked = !updatedRows[index].checked;
    setRows(updatedRows);
  };

  const handleSubmit = () => {
    const completedTasks = rows.filter(row => row.checked).length;
    const totalTasks = rows.length;
    setShowNotif(true);
  }

  return (
    <div className="w-full">
      <table className="font-poppins w-full table-auto justify-start border-collapse">
        <thead className="bg-tersier">
          <tr>
            <th className="px-4 py-2 w-7/12 rounded-tl-lg text-left">
              <div className="flex items-center gap-1"><ListChecks /> Activity </div>
            </th>
            <th className="px-4 py-2 w-1/12 text-center rounded-tr-lg">
              <div className="flex items-center justify-center gap-1"><CircleCheckBig /></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b-2 border-tersier">
              <td className="py-4 px-4 border-r-2 border-l-2 border-tersier">{row.task}</td>
              <td className="py-4 px-4 border-r-2 border-l-2 text-center">
                <button
                  onClick={() => toggleCheck(index)}
                  className={
                    row.checked
                      ? "text-green-500 hover:text-green-700"
                      : "text-gray-300 hover:text-gray-400"
                  }
                >
                  <Check size={20} strokeWidth={4} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <Button text="Submit" onClick={handleSubmit}></Button>
      </div>
      
      <Notification open={showNotif} onClose={() => setShowNotif(false)} />
      
    </div>
  );
}
