import { useState } from "react";
import { Check, CircleCheckBig, ListChecks, NotebookPen, PlusCircle } from "lucide-react";

const initialRows = [
  { task: "Cek kop surat", note: "Revisi nomor kop", checked: false },
  { task: "Cek tanda tangan", note: "Perbaiki posisi", checked: false },
];

export default function ChecklistTable() {
  const [rows, setRows] = useState(initialRows);
  const [newTask, setNewTask] = useState("");

  const toggleCheck = (index: number) => {
    const updatedRows = [...rows];
    updatedRows[index].checked = !updatedRows[index].checked;
    setRows(updatedRows);
  };

  const handleNoteChange = (index: number, newNote: string) => {
    const updatedRows = [...rows];
    updatedRows[index].note = newNote;
    setRows(updatedRows);
  };

  const handleAddTask = () => {
    if (newTask.trim() !== "") {
      const updatedRows = [...rows, { task: newTask, note: "", checked: false }];
      setRows(updatedRows);
      setNewTask("");
    }
  };

  return (
    <div className="w-full">
      <table className="font-poppins w-full table-auto justify-start border-collapse">
        <thead className="bg-tersier">
          <tr>
            <th className="px-4 py-2 w-7/12 rounded-tl-lg text-left">
              <div className="flex items-center gap-1"><ListChecks /> Check List</div>
            </th>
            <th className="px-4 py-2 w-4/12 text-left">
              <div className="flex items-center gap-1"><NotebookPen /> Notes</div>
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
              <td className="py-4 px-4 border-r-2 border-l-2">
                <input
                  type="text"
                  value={row.note}
                  onChange={(e) => handleNoteChange(index, e.target.value)}
                  className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-primary"
                  placeholder="Add a note..."
                />
              </td>
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

      {/* Input baru dan tombol add */}
      <div className="w-full  mt-4 flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="w-4/5 p-2 border border-gray-300 rounded-md outline-none focus:border-primary"
          placeholder="Add a new checklist..."
        />
        <button
          onClick={handleAddTask}
          className="flex w-1/5 justify-center items-center gap-1 px-4 py-2 bg-secondary text-black font-bold rounded-md hover:bg-emerald-400"
        >
          <PlusCircle size={20} /> Add Checklist
        </button>
      </div>
    </div>
  );
}
